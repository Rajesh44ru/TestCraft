import { Component,ChangeDetectionStrategy,ChangeDetectorRef} from "@angular/core";
import { FormGroup, FormBuilder } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { Router } from "@angular/router";
import { NgxSpinnerService } from "ngx-spinner";
import { DataPermissions } from "src/app/shared/enums/DataPermissions";
import { ManagePallet, SemiFinishGoodsQueryObject } from "src/app/shared/models/queryObject";
import { ManagePermissionService } from "src/app/shared/service/ManagePermissions/manage-permission.service";
import { AlertyfyService } from "src/app/shared/service/alertyfy.service";
import { SpinnerManagerService } from "src/app/shared/service/spinnerManager.service";
import { environment } from "src/environments/environment";
import { saveAs as importedSaveAs } from "file-saver";




import {
  palletList,
  palletListResponse,
} from "src/app/shared/models/ManagePallet/managaepallte.class";
import { PalletProductionserviceService } from "src/app/shared/service/ManagePallet/pallet-productionservice.service";
import { DeletedResponse } from "src/app/shared/models/Response/CreateResponse.model";
import { Dropdownlist, PPDropdownlist } from "src/app/shared/models/DropDown/drop-down.model";
import { SemiFinishGoodService } from "src/app/shared/service/SemiFinishGoods/semi-finish-good.service";

@Component({
  selector: "app-list-pallet",
  templateUrl: "./list-pallet.component.html",
  styleUrls: ["./list-pallet.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListPalletComponent {
  RequestForm: FormGroup;
  pageSize = environment.pageSize;
  ManagePallet: any;
  Datalist: palletList[];
  showFilters: Boolean = false;
  ProdList:any=[]
  shareDatalist: any;
  public dataPermission = DataPermissions;
  count: number = 0;
  imageUrl = environment.imageUrl;
  PalletTypeDropdown:any;
  DefaultPalletype:number;
  //baseUrl = environment.apiUrl;
  columns = [
    { title: "SN", key: "Id", isSortable: true, isFixed: true },
    { title: "Pallet ID", key: "palletId", isSortable: false, isFixed: false },
   
    {
      title: "Barcode URL",
      key: "palletIdBarcodeUrl",
      isSortable: false,
      isFixed: false,
    },
    {
      title: "Part Number",
      key: "partNumber",
      isSortable: false,
      isFixed: false,
    },
    {
      title: "Description",
      key: "description",
      isSortable: false,
      isFixed: false,
    },
    { title: "WorkOrderNumber", key: "WorkOrderNumber", isSortable: false, isFixed: false },
    { title: "ROHS", key: "isVerified", isSortable: false, isFixed: false },
    { title: "Is Verified", key: "rohs", isSortable: false, isFixed: false },
    { title: "QR Code", key: "qrCode", isSortable: false, isFixed: false },
    { title: "Serial Number", key: "serialNos", isSortable: false, isFixed: false },
    { title: "Is Active", key: "Isactive", isSortable: false, isFixed: false },
    { title: "Action" },
  ];
  queryObject = new ManagePallet()
  SemiFinishGoodsQueryObject = new SemiFinishGoodsQueryObject()
  noDataFound: string;
  public loading: string = environment.loadingSpinner;
  public saving: string = environment.savingSpinner;
  constructor(
    private fb: FormBuilder,
    private modalService: NgbModal,
    private alertyfy: AlertyfyService,
    private _Service: PalletProductionserviceService,
    private _service: SemiFinishGoodService,
    private route: Router,
    private spinner: NgxSpinnerService,
    private spinningManager: SpinnerManagerService,
    public mps: ManagePermissionService,
    private cdr: ChangeDetectorRef
  ) {
    this.spinningManager.showSpinner(this.loading);
    this.noDataFound = environment.noDataFound;
  }


  ngOnInit() {
    this.loadProductionPlan();
    this.getPalletTypeDDL();
    //this.Reset();
    this.noDataFound = environment.noDataFound;
  }


  Render(id) {
    if (id > 0) {
      this.route.navigateByUrl("/managepallet/ListDetails/" + id);
    }
  }


  generateBarcode(id) {
    if (id > 0) {
      this.spinningManager.showSpinner("..Generating");
      this._Service.generatePalletBarcode(id).subscribe((res) => {
        if (res.status == 200) {
          this.alertyfy.success("Generated SucessFully");
          this.Search();
        }
      });
      this.spinningManager.hideSpinner();
    }
  }
  onedit(id: number) {
    this.route.navigate(["/managepallet/edit-pallet", id]);
    this.count++;
  }
  showHideFilter() {
    this.showFilters = !this.showFilters;
  }
    //ProductionPlan dropdown list
  
    loadProductionPlan() {
      //this.spinningManager.showSpinner("...Loading")
      this._service.getProdPlanDDL().subscribe({next:(result: PPDropdownlist) => {
       this.ProdList = result.data;
       //this.spinningManager.hideSpinner();
      }, error:(err) => {
        //this.spinningManager.hideSpinner();
      }});
    }

    
    getPalletTypeDDL(){
      this._service.getPalletDDL().subscribe((res: Dropdownlist) => {
        this.PalletTypeDropdown = res.data;
        this.DefaultPalletype=this.PalletTypeDropdown.filter(x=>x.code=='SemiFG_Pallet')[0].id;
        this.queryObject.mstPalletTypeId=this.DefaultPalletype;
        this.showFilters=true;
        this.Reset();
        // this.spinningManager.hideSpinner();
      });
    }
  getQueryPallet() {
    this.spinningManager.showSpinner(this.loading);
    return this._Service.Search(this.queryObject).subscribe(
      (Datalist: palletListResponse) => {
        this.queryObject.pageCount = Datalist.data.totalItems;
        // console.log("query",this.queryObject)
        // console.log("PageCount",this.queryObject.pageCount)
        this.ManagePallet = Datalist.data.items;
        this.cdr.detectChanges();
        this.spinningManager.hideSpinner();
      },
      (error) => {
        this.alertyfy.error(error);
        this.noDataFound = error;
        this.spinningManager.hideSpinner();
      }
    );
  }
  public Reset() {
    this.queryObject.page = 1;
    this.queryObject.pageSize = this.pageSize;
    this.queryObject.searchString = "";
    this.queryObject.isSortAsc = false;
    this.queryObject.sortBy = "";
    this.queryObject.isVerified=null;
    this.SemiFinishGoodsQueryObject.searchString = "";
    this.SemiFinishGoodsQueryObject.page = 1;
    this.SemiFinishGoodsQueryObject.pageSize = 10;
    this.queryObject.productionPlanId=0;
    //this.queryObject.mstPalletTypeId=0;
    //this.queryObject.productionPlanId=-1;
    this.getQueryPallet();
    //this.cdr.detectChanges();
  }
  public SearchInput(evt: any) {
    if (evt.key == "Enter") {
      this.Search();
    }
  }

  public Search() {
      this.spinner.show();
      this.getQueryPallet();
  }

  delete(id) {
    this.alertyfy.confirmDeletion("", () => {
      this._Service.delete(id).subscribe({
        next: (res: DeletedResponse) => {
          // console.log(res);
          this.alertyfy.success("Deleted Successfully.");
          this.getQueryPallet();
        },
        error: (err) => {
          this.alertyfy.error(err);
        },
      });
    });
  }

  public sortBy(columnName) {
    if (this.queryObject.sortBy === columnName) {
      this.queryObject.isSortAsc = !this.queryObject.isSortAsc;
    } else {
      this.queryObject.sortBy = columnName;
      this.queryObject.isSortAsc = true;
    }
    this.getQueryPallet();
  }
  public onPageChange(page) {
    this.queryObject.page = page;
    this.getQueryPallet();
  }
  public changePageSize(event) {
    this.queryObject.pageSize = event.target.value;
    this.getQueryPallet();
  }

  
  //excel print functionality
  public exportToExcel(flag: boolean) {
    this.SemiFinishGoodsQueryObject.printall = flag;
    this._service.exportAllItemsToExcel(this.SemiFinishGoodsQueryObject).subscribe((res) => {
      console.log(res);
      importedSaveAs(res, "Manage Pallete.xlsx");
    });
  }

  //pdf print functionality
  public exportToPdf(flag: boolean) {
    this.SemiFinishGoodsQueryObject.printall = flag;
    this._service.exportAllItemsToPDF(this.SemiFinishGoodsQueryObject).subscribe((res) => {
      importedSaveAs(res, "Manage Pallet.pdf");
    });
  }

}
