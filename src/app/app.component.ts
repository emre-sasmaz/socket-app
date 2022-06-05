import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  filter,
  fromEvent,
  map,
  Observable,
  of,
  repeat,
  retry,
  Subject,
  switchMap,
  takeUntil,
  throttleTime,
} from 'rxjs';
import { DataModel, INTERVAL_OPT, IS_CRITICAL, SCROLL_THRESHOLD, TableDataModel } from './models/stream.models';
import { colFilterOption, colSortOption, STREAM_TABLE_COL, TableColModel } from './models/table.models';
import { StreamService } from './services/stream.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tableView') tableView!: ElementRef<HTMLDivElement>;

  onDestroy$: Subject<void> = new Subject();

  form: FormGroup;
  isCriticalFields = [IS_CRITICAL.YES, IS_CRITICAL.NO, IS_CRITICAL.ALL];

  tableColumns: TableColModel<DataModel>[] = STREAM_TABLE_COL;
  tableDataSource$: BehaviorSubject<TableDataModel[]> = new BehaviorSubject<TableDataModel[]>([]);
  tableData: TableDataModel[] = [];

  triggerEvent$: BehaviorSubject<boolean | null> = new BehaviorSubject<boolean | null>(null);
  automaticScrollEvent$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  filterEvent$: BehaviorSubject<colFilterOption> = new BehaviorSubject<colFilterOption>({ col: 'isCritical', filter: IS_CRITICAL.ALL });
  sortEvent$: BehaviorSubject<colSortOption> = new BehaviorSubject<colSortOption>({ col: 'startTimeMs', sort: 'ascending' });

  constructor(private streamService: StreamService, private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      interval: [INTERVAL_OPT.startingInt, [Validators.min(INTERVAL_OPT.minInt), Validators.max(INTERVAL_OPT.maxInt)]],
      isCritical: [IS_CRITICAL.ALL],
    });

    this.form
      .get('isCritical')
      ?.valueChanges.pipe(takeUntil(this.onDestroy$))
      .subscribe((isCritical) => this.filterEvent$.next({ col: 'isCritical', filter: isCritical }));
  }

  ngOnInit(): void {
    this.triggerEvent$
      .pipe(
        takeUntil(this.onDestroy$),
        filter((v) => v !== null),
        switchMap((event) => {
          let res: Observable<boolean | string>;
          if (event) {
            this.form.get('interval')?.disable();
            res = this.streamService.startStream(this.form.get('interval')?.value);
          } else {
            this.form.get('interval')?.enable();
            res = this.streamService.stopStream();
          }
          this.form.updateValueAndValidity();
          return res;
        }),
        catchError(() => of(null)),
        repeat()
      )
      .subscribe();

    this.streamService.webSocketSubject$
      .pipe(
        takeUntil(this.onDestroy$),
        map((socketData) => socketData.map((v) => new TableDataModel(v, false))),
        retry()
      )
      .subscribe((dataSource) => {
        dataSource = dataSource.filter((data) => {
          let ind = this.tableDataSource$.value.findIndex((k) => k.data.dataId === data.data.dataId);
          if (ind >= 0) {
            data.checked = true;
            setTimeout(() => {
              data.checked = false;
            }, 2000);
            this.tableDataSource$.value[ind] = data;
            return false;
          }
          return true;
        });

        this.tableDataSource$.next([...dataSource, ...this.tableDataSource$.value]);
      });

    combineLatest([this.tableDataSource$, this.sortEvent$, this.filterEvent$, this.automaticScrollEvent$])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(([tableDataSource, sortEvent, filterEvent, automaticScrollEvent]) => {
        this.tableData = [...this.sort(this.filter(tableDataSource, filterEvent), sortEvent)];
        if (automaticScrollEvent) {
          setTimeout(() => {
            this.tableView.nativeElement.scrollTop = this.tableView.nativeElement.scrollHeight;
          }, 0);
        }
      });
  }

  ngAfterViewInit(): void {
    fromEvent(this.tableView.nativeElement, 'scroll')
      .pipe(takeUntil(this.onDestroy$), throttleTime(150))
      .subscribe(() => {
        this.automaticScrollEvent$.next(
          this.tableView.nativeElement.scrollHeight - this.tableView.nativeElement.scrollTop - this.tableView.nativeElement.clientHeight <=
            SCROLL_THRESHOLD
        );
      });
  }

  trigger(stop?: boolean): void {
    this.triggerEvent$.next(stop ? !stop : !this.triggerEvent$.value);
  }

  getData(data: DataModel, col: TableColModel<DataModel>): any {
    if (col.fieldName === 'startTimeMs' || col.fieldName === 'stopTimeMs') {
      return new Date(data[col.fieldName]);
    } else {
      return data[col.fieldName];
    }
  }

  trackByRow(index: number, data: TableDataModel) {
    return data.data.dataId;
  }

  trackByCol(index: number, col: TableColModel<DataModel>) {
    return col.fieldName + index;
  }

  sort(data: TableDataModel[], sortConfig: colSortOption) {
    return data.sort((a, c) => {
      let d1 = a.data[sortConfig.col];
      let d2 = c.data[sortConfig.col];
      return ((isNaN(+d1) ? 0 : +d1) - (isNaN(+d2) ? 0 : +d2)) * (sortConfig.sort === 'ascending' ? 1 : -1);
    });
  }

  filter(data: TableDataModel[], filterConfig: colFilterOption) {
    return data.filter((value) => {
      if (filterConfig.filter !== IS_CRITICAL.ALL) {
        return filterConfig.filter === IS_CRITICAL.YES ? value.data.isCritical : !value.data.isCritical;
      }
      return true;
    });
  }

  sortTrigger(col: TableColModel<DataModel>) {
    this.sortEvent$.next({ col: col.fieldName, sort: this.sortEvent$.value?.sort === 'ascending' ? 'descending' : 'ascending' });
  }

  ngOnDestroy(): void {
    this.trigger(true);
    this.onDestroy$.next();
    this.onDestroy$.complete();
  }
}
