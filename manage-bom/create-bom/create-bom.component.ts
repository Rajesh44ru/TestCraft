import { Component, OnInit } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbDateStruct, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { OtherItemsThatUsesProdDialog } from "src/app/shared/enums/ClientHomeEnum";
import {
  Inventory,
  InventoryItem,
  InventoryItemVM,
  InventoryStatusEnum,
} from "../../../shared/models/inventory";
import { AlertyfyService } from "src/app/shared/service/alertyfy.service";
import { InventoryService } from "src/app/shared/service/Inventory/inventory.service";
import { ProductService } from "src/app/shared/service/Product/product-service";
import { environment } from "src/environments/environment";
import { LocalStorageService } from "../../../shared/service/local-storage.service";
import { NgxSpinnerService } from "ngx-spinner";
import { SpinnerManagerService } from "src/app/shared/service/spinnerManager.service";
import { BomService } from "src/app/shared/service/ManageBom/bom.service";
import { DataDropDownlist, Dropdownlist, DropdownlistBOMDDL } from "src/app/shared/models/DropDown/drop-down.model";
import { MstBomItemDialogComponent } from "src/app/shared/components/mst-bom-item-dialog/mst-bom-item-dialog.component";
import {
  BOMTypeEnum,
  BOmStatusEnum,
  Bom,
  BomDetailsItem,
} from "src/app/shared/models/ManageBom/bom.model";
import { CreateResponse } from "src/app/shared/models/Response/CreateResponse.model";
import { datetime } from "rrule";
import { DateTime } from "rrule/dist/esm/datetime";
@Component({
  selector: "app-create-bom",
  templateUrl: "./create-bom.component.html",
  styleUrls: ["./create-bom.component.scss"],
})
export class CreateBomComponent {
  public loading: string = environment.loadingSpinner;
  public saving: string = environment.savingSpinner;
  baseUrlForImage = environment.imageUrl;
  bomItemIdValueArray: any[] = [];
  BomForm!: FormGroup;
  inventoryFileForm!: FormGroup;
  inventoryId = 0;
  active: number = 1;
  showFileSave = false;
  public formData: FormData;
  public files: any = [];
  ProjectList: any;
  FinishGoodsList: any;
  bomitems: any[] = [];
  ddlList: any[] = [];
  BomItemForms: FormArray = this.fbItem.array<FormArray>([]);
  fromDate: NgbDateStruct;
  grandTotal = 0;
  netValueArray: [number];
  deletedFiles: any = [];
  inventoryStatus: number = 0;
  public isDeduct: boolean = false;
  filterDateFrom: any;
  bomId: any;
  EffectiveFromDate: NgbDateStruct;
  isShowFG:boolean=false;
  MaterialTypeList: any[];
  UnitList: any[];
  BOMList: any[];
  finishGoodsProductionStageList: any[];
  BomData: any = [];
  //placement="left";
  constructor(
    private modalService: NgbModal,
    private inventoryService: InventoryService,
    private fbInv: FormBuilder,
    private fbFile: FormBuilder,
    private fbItem: FormBuilder,
    private router: Router,
    private alertyfy: AlertyfyService,
    private localStorageService: LocalStorageService,
    private route: ActivatedRoute,
    private spinner: NgxSpinnerService,
    private _Service: BomService,

    private spinnerManager: SpinnerManagerService
  ) {
    this.spinnerManager.showSpinner(this.loading);
    this.localStorageService.clearSelectedInventoryItems();
    this.spinnerManager.hideSpinner();
  }

  ngOnInit() {
    this.LoadProjectList();
    this.LoadFinishGoodsList();
    this.loadBomDDL();
    // this.LoadDDL();
    //this.addBomItemForm();
    this.BomForm = this.fbInv.group({
      id:[0],
      name:['',Validators.required],
      revisionNumber:[0,Validators.required],
      subRevisionNumber:[0,Validators.required],
      model:[{value:'',disabled:true},Validators.required],
      remarks:[''],
      mstProjectId:[0,Validators.required],
      mstFinishGoodsId:[0,Validators.required],
      bomType:[0,Validators.required],
      fgBomId:[0],
      ecnNumber:['',Validators.required],
      productPartNumber:[{value:'',disabled:true},Validators.required],
      effectiveFrom:[DateTime,Validators.required],
      isActive:[true],
      bomitemForm: this.fbInv.array<FormArray>([])
    });

    this.inventoryFileForm = this.fbFile.group({
      file_: "",
    });
  }

  LoadProjectList() {
    this._Service.projectList().subscribe((res: DataDropDownlist) => {
      //console.log("Res",res)
      this.ProjectList = res.data;
    });
  }
  LoadFinishGoodsList() {
    this._Service.loadFinishGoodsList().subscribe((res: DataDropDownlist) => {
      this.FinishGoodsList = res.data;
    });
  }
  loadBomDDL() {
    this._Service.getBomDDL().subscribe({
      next: (result: DropdownlistBOMDDL) => {
        this.BomData = result.data;
        this.spinnerManager.hideSpinner();
      },
      error: (err) => {
        this.spinnerManager.hideSpinner();
      },
    });
  }

  LoadDDL() {
    this._Service.getDDL().subscribe({
      next: (res) => {
        if (res.status == 200) {
          this.MaterialTypeList = res.data.materialTypeDDLList;
          this.UnitList = res.data.unitDDLList;
          this.finishGoodsProductionStageList = res.data.productionStageDDLList;
        } else this.alertyfy.error("Something went wrong.");
      },
    });
  }
  ShowFG(){
    debugger;
    var val = this.BomForm.value.bomType;
    if(this.BomForm.value.bomType==BOMTypeEnum.none) return;
    if(this.BomForm.value.bomType==BOMTypeEnum.FinishGoods){
      this.isShowFG=false;
    }
    if(this.BomForm.value.bomType==BOMTypeEnum.SemiFinishGoods){
      if(this.BomForm.value.mstFinishGoodsId>0){
        this.isShowFG=true;
        this.BomData= this.BomData.filter(x=>x.mstFinishGoodsId==this.BomForm.value.mstFinishGoodsId && x.bomType==BOMTypeEnum.FinishGoods)
      }else{
        this.alertyfy.error("Please Select Finigoods");
      }

    };
  }
  setValue(item){
    var id = parseInt(item.split(":")[1]);
    var val = this.FinishGoodsList.filter(x => x.id == id);
    if(val != null){
      this.BomForm.patchValue({
        model:val[0].model,
        productPartNumber:val[0].partNumber
      });
      //this.ShowFG();
    }
  }

  dateChanged(eventDate: string): Date | null {
    return !!eventDate ? new Date(eventDate) : null;
  }
  getFormControls(formName: string) {
    return (this.BomForm.controls[formName] as FormArray).controls;
  }

  //#region inventory-file

  onSelect(event) {
    this.formData = new FormData();
    this.files.push(...event.addedFiles);
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].type != undefined) {
        this.formData.append("files[]", this.files[i]);
      }
    }
  }

  onDeleteFile(index) {
    // this.formData.delete('files[]');
    this.formData = new FormData();
    var deletedFile = this.files[index];
    this.files.splice(index, 1);
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].type != undefined) {
        this.formData.append("files[]", this.files[i]);
      }
    }
    if (
      deletedFile != null &&
      deletedFile.id != null &&
      deletedFile.id != undefined &&
      deletedFile.id > 0
    ) {
      this.deletedFiles.push(deletedFile.id);
    }
  }
  onSave() {

    const _date = new Date(this.EffectiveFromDate.year, this.EffectiveFromDate.month - 1, this.EffectiveFromDate.day + 1) || new Date();

    // if(this.BomForm.getRawValue().bomType==BOMTypeEnum.SemiFinishGoods && (this.BomForm.getRawValue().fgBomId=='' ||this.BomForm.getRawValue().fgBomId==null )){
    //   this.alertyfy.error("Please Selelct FiniGoods Bom");
    //   return;
    // }

    if(this.BomForm.invalid){
      this.BomForm.markAllAsTouched()
      return;
    }
    this.spinnerManager.showSpinner("...Saving...");
    //  this.onSaveBomItem(BOmStatusEnum.saveDraft);
    
    if (this.BomForm.valid) {
      var bomdata = new Bom();
      bomdata.name = this.BomForm.getRawValue().name;
      bomdata.model = this.BomForm.getRawValue().model;
      bomdata.productPartNumber = this.BomForm.getRawValue().productPartNumber;
      bomdata.ecnNumber = this.BomForm.getRawValue().ecnNumber;
      bomdata.revisionNumber = this.BomForm.getRawValue().revisionNumber;
      bomdata.subRevisionNumber = this.BomForm.getRawValue().subRevisionNumber;
      bomdata.isActive = this.BomForm.getRawValue().isActive;
      bomdata.mstProjectId = this.BomForm.getRawValue().mstProjectId;
      bomdata.mstFinishGoodsId = this.BomForm.getRawValue().mstFinishGoodsId;
      bomdata.remarks = this.BomForm.getRawValue().remarks;
      bomdata.bomType = this.BomForm.getRawValue().bomType;
      //bomdata.fgBomId = this.BomForm.getRawValue().fgBomId;
      bomdata.effectiveFrom = _date;
      this._Service.create(bomdata).subscribe({
        next: (res: CreateResponse) => {
          if (res.status == 200) {
            this.alertyfy.success("Saved Successfully.");
            //this.router.navigateByUrl("/ManageBom/list-bom");
            this.router.navigate(["/ManageBom/edit-bom", res.id]);

            ///dsbfhgsdhjfg
          } else {
            this.alertyfy.error("Something went wrong");
          }
          this.spinnerManager.hideSpinner();
        },
        error: (err) => {
          this.spinnerManager.hideSpinner();
          this.alertyfy.error("Something went Wrong.");
        },
      });
    } else {
      this.BomForm.markAllAsTouched();
    }
  }

  onSaveAndApplyNow() {
    this.alertyfy.confirm("Are you sure to apply this inventory?", () => {
      this.onSaveBomItem(BOmStatusEnum.saveAndApplyNow);
    });
  }
  onSaveAndSaveAverage() {
    this.alertyfy.confirm("Are you sure to apply this inventory?", () => {
      this.onSaveBomItem(BOmStatusEnum.saveAndApplyAverage);
    });
  }

  onSaveBomItem(saveType) {
    var _bom = this.BomForm.value;
    var bom = new Bom();
    const _effectiveForm =
      new Date(
        this.EffectiveFromDate.year,
        this.EffectiveFromDate.month,
        this.EffectiveFromDate.day
      ) || new Date();
    bom.id = Number(_bom.id) || 0;
    bom.revisionNumber = _bom.revisionNumber;
    bom.isActive = _bom.isActive;
    // bom.effectiveFrom= _bom.effectiveFrom;
    bom.effectiveFrom = _effectiveForm;
    bom.productPartNumber = _bom.productPartNumber;
    bom.ecnNumber = _bom.ecnNumber;
    bom.mstFinishGoodsId = _bom.mstFinishGoodsId;
    bom.mstProjectId = _bom.mstProjectId;
    bom.remarks = _bom.remarks;
    bom.model = _bom.model;
    bom.name = _bom.name;
    bom.subRevisionNumber = _bom.subRevisionNumber;
    var bomBundle = {
      bomData: bom,
      bomDetailItemDatas: this.BomForm.getRawValue().bomitemForm,
    };
    this._Service.CreateBOMWithDetailsItem(bomBundle).subscribe((res) => {
      if (res > 0) {
        if (this.files.length > 0 || this.deletedFiles.length > 0) {
          //this.formData = new FormData();
          this.bomId = res;
          this.formData.append("BomId", this.bomId);
          this.formData.append("DeletedIds", this.deletedFiles);
          this.files = [];
          var isNew = true;
          this._Service
            .InsertBomFiles(this.formData, isNew ? 0 : this.bomId)
            .subscribe(
              (response_f) => {
                this.spinnerManager.hideSpinner();
                // this.alertyfy.success("Saved files.");
                this.showMessage(saveType);
                this.router.navigate(["/ManageBom/list-bom"]);
              },
              (error) => {
                this.alertyfy.error(error);
                this.spinnerManager.hideSpinner();
                this.alertyfy.error(
                  "Some problem might have occured while saving files."
                );
              }
            );
        }
      }
    });
  }

  showMessage(saveType) {
    switch (saveType) {
      case BOmStatusEnum.saveDraft:
        this.alertyfy.success("Saved as Draft.");
        this.spinnerManager.hideSpinner();
        break;
      default:
        this.alertyfy.warning("Something might have gone wrong");
        this.spinnerManager.hideSpinner();
    }
  }

  onRemoveItem(idx) {
    const bomitemform = this.BomForm.controls["bomitemForm"] as FormArray;
    bomitemform.removeAt(idx);
  }

  //#endregion

  openPopUp() {
    const modalRef = this.modalService.open(MstBomItemDialogComponent, {
      size: <any>"lg",
    });

    modalRef.result
      .then((emitted) => {
        if (emitted.isSavePressed) {
          this.bomItemIdValueArray = emitted.bomItemIdValueArray.filter(
            function (item) {
              return item.status == true;
            }
          );
          this.processSelectedBomItem();
        }
      })
      .catch((reason) => {});
  }

  processSelectedBomItem() {
    /*save to the browser memory, the inventory-items array value: */
    var index = 0;
    //this.localStorageService.addSelectedBomsItems(this.bomItemIdValueArray);
    //console.log("bomdetails",this.bomItemIdValueArray)
    this.bomItemIdValueArray.forEach((prod) => {
      var bomItem = new BomDetailsItem();
      this._Service.getItemListbyitemId(prod.ItemId).subscribe((res) => {
       
        bomItem.id = 0;
        bomItem.itemName = res.data.name;
        bomItem.itemId = res.data.id ?? 0;
        bomItem.unitId = res.data.mstUnitId ?? 0;
        bomItem.mSTMaterialTypeId = res.data.mstMaterialTypeId ?? 0;
        bomItem.mSTBOMId = prod.mstBomId ?? 0;
        bomItem.FinishGoodsProductionStageId =
          prod.finishGoodsProductionStageId ?? 0;

        this.bomitems.push(bomItem);
        (this.BomForm.controls["bomitemForm"] as FormArray).push(
          this.fbInv.group({
            id: [0],
            itemId: [bomItem.itemId],
            itemName: new FormControl(
              { value: bomItem.itemName, disabled: true },
              Validators.required
            ),
            qunatity: [0],
            unitId: [{ value: bomItem.unitId ?? 0, disabled: true }],
            mSTMaterialTypeId: [
              { value: bomItem.mSTMaterialTypeId ?? 0, disabled: true },
            ],
            finishGoodsProductionStageId: 0,
            mSTBOMId: [{ value: prod.mstBomId ?? 0, disabled: false }],
          })
        );
      });
      index++;
    });
  }
  //#endregion

  //#region private methods
  private getNgbFormatDate(_date_) {
    var result = _date_.split("-");
    var ngbDate = {
      year: Number(result[0]),
      month: Number(result[1]),
      day: Number(result[2]),
    };
    return ngbDate;
  }
}
