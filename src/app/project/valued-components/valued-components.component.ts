import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { ValuedComponent } from 'app/models/valuedComponent';
import { ValuedComponentService } from 'app/services/valued-component.service';
import { PlatformLocation } from '@angular/common';
import { TableObject } from 'app/shared/components/table-template/table-object';
import { ValuedComponentTableRowsComponent } from './valued-component-table-rows/valued-component-table-rows.component';
import { TableTemplateUtils } from 'app/shared/utils/table-template-utils';

@Component({
  selector: 'app-valued-components',
  templateUrl: './valued-components.component.html',
  styleUrls: ['./valued-components.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValuedComponentsComponent implements OnInit, OnDestroy {
  private ngUnsubscribe: Subject<boolean> = new Subject<boolean>();
  public valuedComponents: ValuedComponent[] = null;
  public loading = true;

  public valuedComponentTableData: TableObject;
  public valuedComponentTableColumns: any[] = [
    {
      name: 'Type',
      value: 'type',
      width: 'col-3'
    },
    {
      name: 'Title',
      value: 'title',
      width: 'col-5'
    },
    {
      name: 'Pillar',
      value: 'pillar',
      width: 'col-2'
    },
    {
      name: 'Parent',
      value: 'parent',
      width: 'col-2'
    }
  ];

  public pageNum = 0;
  public sortBy = '';
  public sortDirection = 0;
  public pageSize = 10;
  public currentPage = 1;
  public totalListItems = 0;

  private currentProjectId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private valuedComponentService: ValuedComponentService,
    private _changeDetectionRef: ChangeDetectorRef,
    private tableTemplateUtils: TableTemplateUtils,
  ) { }

  ngOnInit() {
    // get data from route resolver
    this.route.data
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        if (res) {
          this.totalListItems = res.valuedComponents.totalCount;
          if (this.totalListItems > 0) {
            this.valuedComponents = res.valuedComponents.data;
            this.currentProjectId = res.valuedComponents.projectId;
            this.setVCRowData();
          }
        } else {
          alert('Uh-oh, couldn\'t load valued components');
          // project not found --> navigate back to search
          this.router.navigate(['/search']);
        }
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      }
      );
  }

  // TODO: Add VC
  // addVC(vc) {
  //   let dlg = this.modalService.open(AddAddVComponent, { backdrop: 'static', windowClass: 'day-calculator-modal' });
  //   dlg.componentInstance.model = vc;
  //   dlg.result.then(result => {
  //     switch (result) {
  //       case ModalResult.Save:
  //         this.getPaginatedVcs(this.currentPage);
  //       break;
  //     }
  //   });
  //   return;
  // }

  setVCRowData() {
    let vcList = [];
    this.valuedComponents.forEach(valuedComponent => {
      vcList.push(
        {
          type: valuedComponent.type,
          title: valuedComponent.title,
          pillar: valuedComponent.pillar,
          parent: valuedComponent.parent == null ? 'None' : valuedComponent.parent
        }
      );
    });
    this.valuedComponentTableData = new TableObject(
      ValuedComponentTableRowsComponent,
      vcList,
      {
        pageSize: this.pageSize,
        currentPage: this.currentPage,
        totalListItems: this.totalListItems,
        sortBy: this.sortBy,
        sortDirection: this.sortDirection
      }
    );
  }

  setColumnSort(column) {
    this.sortBy = column;
    this.sortDirection = this.sortDirection > 0 ? -1 : 1;
    this.getPaginatedVCs(this.currentPage, this.sortBy, this.sortDirection);
  }

  getPaginatedVCs(pageNumber, sortBy, sortDirection) {
    // Go to top of page after clicking to a different page.
    window.scrollTo(0, 0);
    this.loading = true;

    if (sortBy == null) {
      sortBy = this.sortBy;
      sortDirection = this.sortDirection;
    }

    let sorting = null;
    if (sortBy !== '') {
      sorting = (sortDirection > 0 ? '+' : '-') + sortBy;
    }

    this.valuedComponentService.getAllByProjectId(this.currentProjectId, pageNumber, this.pageSize, sorting)
      .takeUntil(this.ngUnsubscribe)
      .subscribe((res: any) => {
        this.currentPage = pageNumber;
        this.sortBy = sortBy;
        this.sortDirection = this.sortDirection;
        this.tableTemplateUtils.updateUrl(sorting, this.currentPage, this.pageSize);
        this.totalListItems = res.totalCount;
        this.valuedComponents = res.data;
        this.setVCRowData();
        this.loading = false;
        this._changeDetectionRef.detectChanges();
      });
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}