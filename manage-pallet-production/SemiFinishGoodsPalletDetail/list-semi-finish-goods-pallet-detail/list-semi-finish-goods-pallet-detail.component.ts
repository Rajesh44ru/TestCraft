import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from "@angular/core";
import { Router } from "@angular/router";
import { DataPermissions } from "src/app/shared/enums/DataPermissions";
import {  SemiFinishGoodsPalletDetailsQueryObject } from "src/app/shared/models/queryObject";
import { AlertyfyService } from "src/app/shared/service/alertyfy.service";
import { ManagePermissionService } from "src/app/shared/service/ManagePermissions/manage-permission.service";
import { MstProductionStageService } from "src/app/shared/service/mastersetup/mst-production-stage.service";
import { SpinnerManagerService } from "src/app/shared/service/spinnerManager.service";
import { environment } from "src/environments/environment";
import { saveAs as importedSaveAs } from "file-saver";
import { PageNameEnum } from "src/app/shared/enums/PageNameEnum";
import { PageStateService } from "src/app/shared/service/PageState.service";
import { ConfirmationDialogService } from "src/app/shared/customcontrols/confirmation-dialog/confirmation-dialog.service";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UpsertSemiFinishGoodsPalletDetailComponent } from "../upsert-semi-finish-goods-pallet-detail/upsert-semi-finish-goods-pallet-detail.component";
import { SemiFinisGoodPalletDetailsService } from "src/app/shared/service/ManagePallet/semi-finis-good-pallet-details.service";

@Component({
  selector: 'app-list-semi-finish-goods-pallet-detail',
  templateUrl: './list-semi-finish-goods-pallet-detail.component.html',
  styleUrls: ['./list-semi-finish-goods-pallet-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListSemiFinishGoodsPalletDetailComponent {
  @Input() SemiFinishGoodPalletId: number = 0;
  @Input() hideFields: boolean ;
  //variable declaration
  public Data = [];
  public dataList: any[] = [];
  public Item: any = [];
  public dataPermission = DataPermissions;
  noDataFound: string;
  showFilters: Boolean = false;
  queryObject = new SemiFinishGoodsPalletDetailsQueryObject();
  pageSize = environment.pageSize;

  //spinner
  loading: string = environment.loadingSpinner;
  saving: string = environment.savingSpinner;

  //list header
  columns = [
    { title: "SN", key: "SN", isSortable: true },
    { title: "SemiFinishGoodsPalletId", key: "Name", isSortable: true },
    { title: "SemiFinishGoodsId", key: "Description", isSortable: true },
    { title: "SerialNumber", key: "Type", isSortable: true },
    { title: "Remarks", key: "IsActive", isSortable: true },
    { title: "IsActive", key: "IsActive", isSortable: true },
    { title: "Action" },
  ];

  constructor(
    public mps: ManagePermissionService,
    private _service: SemiFinisGoodPalletDetailsService,
    private _router: Router,
    private alertyfy: AlertyfyService,
    private spinningManager: SpinnerManagerService,
    private confirmationDialogService: ConfirmationDialogService,
    private pageStateService: PageStateService,
    private modalService: NgbModal,
    private cdr: ChangeDetectorRef


  ) {
    this.spinningManager.showSpinner(this.loading);
  }

  ngOnInit() {
    this.checkSearch();
    this.noDataFound = environment.noDataFound;
    this.queryObject.page = 1;
    this.queryObject.pageSize = 10;
    this.queryObject.isActive = null;
    this.getData();
  }

  //getting the data
  getData() {
    this.spinningManager.showSpinner(this.loading);
    this.queryObject.semiFinigoodsPalletId=this.SemiFinishGoodPalletId;
    this._service.search(this.queryObject).subscribe({
      next: (res: any) => {
        this.queryObject.pageCount = res.data.totalItems;
        this.dataList = res.data.items;
        this.cdr.detectChanges();

        this.spinningManager.hideSpinner();
      },
      error: (error) => {
        this.noDataFound = error;
        this.spinningManager.hideSpinner();
      },
    });
  }

  //Sorting Code
  sortBy(columnName) {
    if (this.queryObject.sortBy === columnName) {
      this.queryObject.isSortAsc = !this.queryObject.isSortAsc;
    } else {
      this.queryObject.sortBy = columnName;
      this.queryObject.isSortAsc = true;
    }
    this.getData();
  }

  //pagination code
  onPageChange(page) {
    this.queryObject.page = page;
    this.getData();
  }
  public changePageSize(event) {
    this.queryObject.pageSize = event.target.value;
    this.getData();
  }


  //Filter display Condition
  showHideFilter() {
    this.showFilters = !this.showFilters;
  }

  //Deletion functonality
  delete(id) {
    this.confirmationDialogService
      .confirm("Are you sure", "You want to delete?")
      .then((confirmed) => {
        if (confirmed) {
          this._service.delete(id).subscribe({
            next: (res) => {
              this.alertyfy.success("Deleted Successfully.");
              this.getData();
            },
            error: (error) => {
              this.alertyfy.error(error);
            },
          });
        }
      })
      .catch(() => {
        // console.log('CANCEL');
      });
  }

  //create button navigation to create form component
  create() {
    this._router.navigateByUrl("/mastersetup/create-production-stage");
  }

  // //excel print functionality
  // public exportToExcel(flag: boolean) {
  //   this.queryObject.printall = flag;
  //   this._service.exportAllItemsToExcel(this.queryObject).subscribe((res) => {
  //     importedSaveAs(res, "MST_ProductionStage.xlsx");
  //   });
  // }

  // //pdf print functionality
  // public exportToPdf(flag: boolean) {
  //   this.queryObject.printall = flag;
  //   this._service.exportAllItemsToPDF(this.queryObject).subscribe((res) => {
  //     importedSaveAs(res, "MST_ProductionStage.pdf");
  //   });
  // }

  //filter functionality
  public Search() {
    this.pageStateService.setPageSeachData(
      PageNameEnum.SemiFinishGoodsPalletDetails,
      this.queryObject
    );
    this.getData();
  }

  //filter functionality
  public Reset() {
    this.queryObject.searchString = "";
    this.queryObject.page = 1;
    this.queryObject.isActive = null;
    this.queryObject.pageSize = this.pageSize;
    this.pageStateService.detelePageSeachData(PageNameEnum.SemiFinishGoodsPalletDetails);
    this.getData();
  }
  checkSearch() {
    if (
      this.pageStateService.getPageSeachData(PageNameEnum.SemiFinishGoodsPalletDetails) !=
      null
    ) {
      this.showHideFilter();
      this.queryObject = this.pageStateService.getPageSeachData(
        PageNameEnum.SemiFinishGoodsPalletDetails
      );
    }
  }

  createDataPermisionPopUp(palletDetailsId: number, SemiFinishGoodPalletId: number) {
    const modalRef = this.modalService.open(UpsertSemiFinishGoodsPalletDetailComponent, {
      size: <any>"lg",
    });
    modalRef.componentInstance.palletDetailsId = palletDetailsId;
    modalRef.componentInstance.SemiFinishGoodPalletId = SemiFinishGoodPalletId;
    modalRef.componentInstance.hideFields = this.hideFields;

    modalRef.result
      .then((emitted) => {
          this.getData();
      })
      .catch((reason) => {});
  }
}
