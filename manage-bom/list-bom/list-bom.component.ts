import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ProductDialogComponent } from "src/app/shared/components/product-dialog/product-dialog.component";
import { AlertyfyService } from "src/app/shared/service/alertyfy.service";
import { CategoryService } from "src/app/shared/service/Category/category.service";
import { environment } from "src/environments/environment";
import { moveItemInArray, CdkDragDrop } from "@angular/cdk/drag-drop";
import { ClientHomeEnum } from "../../../shared/enums/ClientHomeEnum";
import { InventoryService } from "src/app/shared/service/Inventory/inventory.service";
import {
  BOMQueryObject,
  QueryObjectInventory,
} from "src/app/shared/models/queryObject";
import { saveAs as importedSaveAs } from "file-saver";
import { NgxSpinnerService } from "ngx-spinner";
import { SpinnerManagerService } from "src/app/shared/service/spinnerManager.service";
import { ManagePermissionService } from "src/app/shared/service/ManagePermissions/manage-permission.service";
import { DataPermissions } from "src/app/shared/enums/DataPermissions";
import { BomDialogComponent } from "../bom-dialog/bom-dialog.component";
import { BomService } from "src/app/shared/service/ManageBom/bom.service";
import { BomQueryDataResponse } from "src/app/shared/models/PaginationDataResponse/pagination-response.model";
import { Bom } from "src/app/shared/models/ManageBom/bom.model";
import { PageNameEnum } from "src/app/shared/enums/PageNameEnum";
import { PageStateService } from "src/app/shared/service/PageState.service";
@Component({
  selector: "app-list-bom",
  templateUrl: "./list-bom.component.html",
  styleUrls: ["./list-bom.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListBomComponent {
  pageSize = environment.pageSize;
  baseUrlForImage = environment.imageUrl;
  z: any = [];
  BOmList: any;
  Datalist: Bom[];
  title = "Bom ";
  showFilters: Boolean = false;
  public dataPermission = DataPermissions;
  categories = [];
  titleCode = ClientHomeEnum.flashdeal;
  expandchildbomIdId:number;
  isTrue:boolean=true;
  IsBomTrue:boolean=false;
  columns = [
    { title: "Name", key: "Name", isSortable: false },
    { title: "Model", key: "model", isSortable: false },
    { title: "Part Number", key: "productPartNumber", isSortable: false },
    { title: "ECN Number", key: "ecnNumber", isSortable: false },
    { title: "Version", key: "version", isSortable: false },
    { title: "Effective From", key: "ecnNumber", isSortable: false },

    { title: "Action" },
  ];
  queryObject = new BOMQueryObject();
  noDataFound: string;
  IsExpand:boolean=false;

  public loading: string = environment.loadingSpinner;
  public saving: string = environment.savingSpinner;
  constructor(
    private modalService: NgbModal,
    private router: Router,
    private alertyfy: AlertyfyService,
    private spinner: NgxSpinnerService,
    private spinningManager: SpinnerManagerService,
    public mps: ManagePermissionService,
    private _Service: BomService,
    private pageStateService: PageStateService,
    private cdr: ChangeDetectorRef
  ) {
    this.noDataFound = environment.noDataFound;
  }

  ngOnInit() {
    this.queryObject.searchString = "";
    this.queryObject.isSortAsc = true;
    this.queryObject.sortBy = "";
    this.queryObject.page = 1;
    this.queryObject.pageSize = this.pageSize;
    this.checkSearch();
    this.getQueryBOM();
  }

  showHideFilter() {
    this.showFilters = !this.showFilters;
  }
  changeStatus(id) {
    if (id != null) {
      this._Service.updateBOmStatus(id).subscribe({
        next: (res) => {
          if (res) {
            //this.getQueryBOM();
          }
        },
      });
    }
  }

  getQueryBOM() {
    this.spinningManager.showSpinner(this.loading);
    return this._Service.Search(this.queryObject).subscribe(
      (Datalist: BomQueryDataResponse) => {
        this.queryObject.pageCount = Datalist.data.totalItems;
        this.BOmList = Datalist.data.items;
        this.cdr.detectChanges();
       // console.log("BOmList",this.BOmList)
        this.spinningManager.hideSpinner();
      },
      (error) => {
        this.alertyfy.error(error);
        this.noDataFound = error;
        this.spinningManager.hideSpinner();
      }
    );
  }
  OnDelete(id) {
    alert(id);
  }

  onEditBOm(id) {
    this.spinner.show();
    this.router.navigate(["/ManageBom/edit-bom/", id]);
    this.spinningManager.hideSpinner();
  }

  public sortBy(columnName) {
    if (this.queryObject.sortBy === columnName) {
      this.queryObject.isSortAsc = !this.queryObject.isSortAsc;
    } else {
      this.queryObject.sortBy = columnName;
      this.queryObject.isSortAsc = true;
    }
    this.getQueryBOM();
  }
  public onPageChange(page) {
    this.queryObject.page = page;
    this.getQueryBOM();
  }
  public changePageSize(event) {
    this.queryObject.pageSize = event.target.value;
    this.getQueryBOM();
  }

  public exportToExcel(flag: boolean) {
    this.queryObject.printall = flag;
     this._Service.exportAllItemsToExcel(this.queryObject).subscribe((res)=>{
         importedSaveAs(res,'BomList.xlsx');
      });
  }
  public exportToPdf(flag: boolean) {
    this.queryObject.printall = flag;
     this._Service.exportAllItemsToPDF(this.queryObject).subscribe((res)=>{
       importedSaveAs(res,'BOMList.pdf');
     });
  }

  //filter functionality
  public Search() {
    this.pageStateService.setPageSeachData(
      PageNameEnum.BOMSearch,
      this.queryObject
    );
    this.getQueryBOM();
  }

  //filter functionality
  public Reset() {
    this.queryObject.searchString = "";
    this.queryObject.isSortAsc = true;
    this.queryObject.sortBy = "";
    this.queryObject.page = 1;
    this.queryObject.pageSize = this.pageSize;
    this.pageStateService.detelePageSeachData(PageNameEnum.BOMSearch);
    this.getQueryBOM();
  }
  checkSearch() {
    if (
      this.pageStateService.getPageSeachData(PageNameEnum.BOMSearch) !=
      null
    ) {
      this.queryObject = this.pageStateService.getPageSeachData(
        PageNameEnum.BOMSearch
      );
      this.showFilters = true;
    }
    this.spinningManager.hideSpinner();
  }
  expandchildBom(item){
    // this.expandchildbomIdId = id;
    // this.IsBomTrue = !this.IsBomTrue;
    // this.isTrue = !this.isTrue;
    item['IsExpand'] =!item['IsExpand'];
  }
}
