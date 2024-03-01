import { Component, OnInit, ViewChild } from "@angular/core";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Inventory, InventoryItemVM } from "src/app/shared/models/inventory";
import { ActivatedRoute, Router } from "@angular/router";
import { AlertyfyService } from "src/app/shared/service/alertyfy.service";
import { environment } from "src/environments/environment";
import { InventoryService } from "src/app/shared/service/Inventory/inventory.service";
import { NgbDateStruct, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ProductDialogComponent } from "src/app/shared/components/product-dialog/product-dialog.component";
import { OtherItemsThatUsesProdDialog } from "src/app/shared/enums/ClientHomeEnum";
import { pipe } from "rxjs";
import { callbackify } from "util";
import { ProductService } from "src/app/shared/service/Product/product-service";
import { BomService } from "src/app/shared/service/ManageBom/bom.service";
import { DataDropDownlist, DropdownlistBOMDDL } from "src/app/shared/models/DropDown/drop-down.model";
import {
  BOMTypeEnum,
  BOmStatusEnum,
  Bom,
  BomChangelogResponse,
  BomDetailsItem,
  BomDetailsItemResponse,
  BomResponse,
} from "src/app/shared/models/ManageBom/bom.model";
import { MstBomItemDialogComponent } from "src/app/shared/components/mst-bom-item-dialog/mst-bom-item-dialog.component";
import { LocalStorageService } from "src/app/shared/service/local-storage.service";
import { SpinnerManagerService } from "src/app/shared/service/spinnerManager.service";
import { BOMApprovalComponent } from "../bomapproval/bomapproval.component";
import { ButtonupdatedatasharingService } from "src/app/shared/service/buttonupdatedatasharing.service";
import { DataPermissions } from "src/app/shared/enums/DataPermissions";
import { ManagePermissionService } from "src/app/shared/service/ManagePermissions/manage-permission.service";

@Component({
  selector: "app-edit-bom",
  templateUrl: "./edit-bom.component.html",
  styleUrls: ["./edit-bom.component.scss"],
})
export class EditBomComponent {
  @ViewChild("reFreshData") reFreshDataChild: any;
  baseUrlForImage = environment.imageUrl;
  BomForm: FormGroup;
  BomFileForm: FormGroup;
  inventoryId: number = 0;
  bomID: any = 0;
  bomdetailId: any = 0;
  showFileSave: boolean = false;
  public formData: FormData;
  public files: any[] = [];

  public resultantFiles: any[] = [];
  inventoryItems: any[] = [];
  bomchangeloglist: any[] = [];
  bomItemIdValueArray: any[] = [];
  itemsId: any[] = [];
  bomitems: any[] = [];
  inventoryItemForms: FormArray = this.fbItem.array([]);
  BomItemForms: FormArray = this.fbItem.array([]);
  fromDate: NgbDateStruct;
  grandTotal: number = 0;
  filterDateFrom: any;
  netValueArray: [number];
  ProjectList: any;
  finishGoodsProductionStageList: any;
  UnitList: any;
  MaterialTypeList: any;
  FinishGoodsList: any;
  DataList: BomDetailsItem[];
  deletedFiles: any = [];
  productionstageDDL: any = [];
  EffectiveFromDate: NgbDateStruct;
  active: number = 1;
  public dataPermission = DataPermissions;
  filelength: number;
  noDataFound: string;
  selectedProjectId: number = 0;
  selectedFinishGoodsId: number = 0;
  isCreatedUser: boolean = false;
  mst_BOMStatus: string;
  AcceptedStage: boolean = false;
  FiniGoodsId:number=1;
  BomData: any = [];
  isShowFG:boolean=false;
  IsCurrentVersion:boolean=false;



  columns = [
   // { title: "ID", key: "id", isSortable: true },
    { title: "Model", key: "Model", isSortable: false },
    { title: "Item", key: "Model", isSortable: false },
    { title: "PartNumber", key: "PartNumber", isSortable: false },
    { title: "New Quantity", key: "newQuantity", isSortable: false },
    { title: "Old Quantity", key: "oldQuantity", isSortable: false },
    { title: "Remarks", key: "remarks", isSortable: false },
    { title: "Action", key: "action", isSortable: true },
    { title: "Created Date", key: "createdOn", isSortable: false },
  ];
  constructor(
    private modalService: NgbModal,
    private inventoryService: InventoryService,
    private fbInv: FormBuilder,
    private fbFile: FormBuilder,
    private fbItem: FormBuilder,
    private router: Router,
    public mps: ManagePermissionService,
    private alertyfy: AlertyfyService,
    private route: ActivatedRoute,
    private _Service: BomService,
    private localStorageService: LocalStorageService,
    private spinnerManager: SpinnerManagerService,
    private _btnUpdateService: ButtonupdatedatasharingService
  ) {
    this.noDataFound = environment.noDataFound;
  }

  ngOnInit() {

    this._btnUpdateService.data.subscribe({
      next: (res) => {
        if (res == true) this.getBomById();
      }
    })

    this.loadForm();
    this.LoadFinishGoodsList();
    this.LoadProjectList();
    this.LoadDDL();
    this.loadBomDDL();

    this.route.paramMap.subscribe(
      (params) => {
        this.bomID = Number(params.get("id"));
        if (this.bomID > 0) {
          this.getBomById();
        } else {
          this.loadForm();
        }
      },
      (error) => { }
    );




  }


  loadForm() {
    this.BomForm = this.fbInv.group({
      id: [0],
      bomType: [{ value: "", disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],
     // fgBomId: [{ value: "", disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],

      revisionNumber: [{ value: 0, disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],
      subRevisionNumber: [{ value: 0, disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],
      model: [{ value: "", disabled: true }],
      name: [{ value: "", disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],
      remarks: [{ value: "", disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],
      mstProjectId: [{ value: "", disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],
      mstFinishGoodsId: [{ value: "", disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],
      ecnNumber: [{ value: "", disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],
      productPartNumber: [{ value: "", disabled: true }],
      effectiveFrom: [{ value: "", disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }, Validators.required],
      isActive: [{ value: false, disabled: (!this.isCreatedUser || this.mst_BOMStatus != 'Draft') }],
      bomitemForm: this.fbInv.array<FormArray>([]),
    });

    this.BomFileForm = this.fbFile.group({
      file_: "",
    });
  }



  dateChanged(eventDate: string): Date | null {
    return !!eventDate ? new Date(eventDate) : null;
  }
  getFormControls(formName: string) {
    return (this.BomForm.controls[formName] as FormArray).controls;


  }
  //FormArrays

  onRemoveItem(idx, item) {
    var itemid = this.itemsId.indexOf(item.itemId);
    this.itemsId.splice(itemid, 1);
    //remove from form:
    //console.log("item", item);
    const bomitemform = (<FormArray>this.BomForm.get("bomitemForm")) as FormArray;
    if (item.id != 0) {
      this.alertyfy.confirm
        (
          "Are you sure you want to delete?",
          () => {
            this._Service.DeleteBOmDEtailsitemById(item.id)
              .subscribe(res => {
                this.alertyfy.success("Deleted Successfully.");
                //this.getBomById();
                bomitemform.removeAt(idx);
              },
                (error) => {
                  this.alertyfy.error("Something went wrong. Delete Failed.");
                });
          }
        );

    }
    else {
      this.alertyfy.confirm
        (
          "Are you sure you want to Remove?",
          () => {
            bomitemform.removeAt(idx);
            this.alertyfy.success("Item Removed");
          },
        );

    }


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

  create() {
    this.router.navigateByUrl("ManageBom/create-bom");
  }


  getBomItems(bomid) {
    if (bomid > 0) {
      this._Service.GetBomDetailsByBomId(bomid).subscribe((res: any) => {
        this.bomdetailId = res.data[0]?.id;
        this.getBomChangelog();
        this.itemsId = res.data.map(({ itemId }) => itemId);
       // console.log("ItemId",this.itemsId)
        res.data.forEach((elem) => {
          (this.BomForm.controls['bomitemForm'] as FormArray).push(
            this.fbInv.group({
              id: [{ value: elem.id, disabled: !this.isCreatedUser }],
              itemId: [{ value: elem.itemId, disabled: !this.isCreatedUser }],
              partNumber: new FormControl(
                { value: elem.partNumber, disabled: true },
                Validators.required
              ),
              description: [{
                value: elem.description,
                disabled: true
              }
              ],
              qunatity: [{ value: elem.qunatity, disabled: (!this.isCreatedUser || (this.AcceptedStage ? true : false)) }],
              unitId: [{ value: elem.unitId, disabled: true }],
              mSTMaterialTypeId: [{ value: elem.mstMaterialTypeId, disabled: (!this.isCreatedUser || (this.AcceptedStage ? true : false)) }],
              finishGoodsProductionStageId: [{
                value: elem.finishGoodsProductionStageId,
                disabled: (!this.isCreatedUser || (this.AcceptedStage ? false :
                  this.mst_BOMStatus == 'Draft' ? false : true))
              }],
              mSTBOMId: [{ value: elem.mstbomId, disabled: (!this.isCreatedUser || (this.AcceptedStage ? true : false)) }],
              isScanable: [{
                value: elem.isScanable, disabled: (!this.isCreatedUser || (this.AcceptedStage ? false :
                  this.mst_BOMStatus == 'Draft' ? false : true))
              }],
              supplierName: [{ value: elem.supplierName, disabled: true }],
              scanFinishGoodsProductionStageId: [{
                value: elem.scanFinishGoodsProductionStageId,
                disabled: (!this.isCreatedUser || (this.AcceptedStage ? false :
                  this.mst_BOMStatus == 'Draft' ? false : true))
              }],
            })

          );
        }

        );
      });
    }
  }

  LoadProjectList() {
    this._Service.projectList().subscribe((res: DataDropDownlist) => {
      this.ProjectList = res.data;
    });
  }
  LoadFinishGoodsList() {
    this._Service.loadFinishGoodsList().subscribe((res: DataDropDownlist) => {
      this.FinishGoodsList = res.data;
    });
  }
  tabchange(event) {
    if (event.nextId === 'ngb-tab-0') {
    }

  }
  openPopUp() {
    const bomitemFormArray = this.BomForm.get('bomitemForm') as FormArray;

    // Extracting itemId from each control in the bomitemFormArray using optional chaining
    const itemIdArray = bomitemFormArray.controls.map(control => control.get('itemId')?.value);

    const modalRef = this.modalService.open(MstBomItemDialogComponent, {
      size: <any>"lg",
    });
    modalRef.componentInstance.selectedItemsId = itemIdArray;

    // modalRef.componentInstance.variantTitle = "";
    //modalRef.componentInstance.variantTitleCode = OtherItemsThatUsesProdDialog.inventoryitem;
    //modalRef.componentInstance.inventoryId = this.inventoryId;
    modalRef.result
      .then((emitted) => {
        if (emitted.isSavePressed) {
          this.bomItemIdValueArray = emitted.bomItemIdValueArray
          this.processSelectedBomItem();
        }
      })
      .catch((reason) => { });
  }
  // processSelectedBomItem() {


  //   var index = 0;
  //   this.localStorageService.addSelectedBomsItems(this.bomItemIdValueArray);
  //   //  console.log("jshadfjhsjf=",this.bomItemIdValueArray);
  //   if (this.bomItemIdValueArray.length == 0 || this.bomItemIdValueArray == undefined) {
  //     this.itemsId = []
  //     const bomitemFormArray = this.BomForm.get('bomitemForm') as FormArray;
  //     bomitemFormArray.clear();
  //     return;

  //   }
  //   this.bomItemIdValueArray.forEach((prod) => {

  //     this.itemsId.push(prod.itemId);

  //     var bomItem = new BomDetailsItem();
  //     this._Service.getMstBomSupplierByMstBomId(prod.mstBomId).subscribe(res => { //For supplier Id
  //       if (res.status == 200) {
  //         bomItem.supplierName = res.data.supplierName;
  //         this._Service.getItemListbyitemId(prod.itemId).subscribe((res) => {
  //           bomItem.id = 0;
  //           bomItem.partNumber = prod.partNumber;
  //           bomItem.description = prod.description;
  //           bomItem.itemId = prod.itemId;
  //           bomItem.itemName = res.data.name;
  //           bomItem.unitId = prod.unitId;
  //           bomItem.mSTMaterialTypeId = res.data.mstMaterialTypeId;
  //           bomItem.mSTBOMId = prod.mstBomId;
  //           bomItem.FinishGoodsProductionStageId =
  //             prod.finishGoodsProductionStageId;
  //           bomItem.isScanable = res.data.isScanable ?? false;

  //           this.bomitems.push(bomItem);
  //           (this.BomForm.controls["bomitemForm"] as FormArray).push(
  //             this.fbInv.group({
  //               id: [0],
  //               itemId: [bomItem.itemId],
  //               partNumber: new FormControl(
  //                 { value: bomItem.partNumber, disabled: true },
  //                 Validators.required
  //               ),
  //               //description:[bomItem.description],
  //               description: new FormControl(
  //                 { value: bomItem.description, disabled: true },
  //               ),
  //               qunatity: [0],
  //               unitId: [bomItem.unitId],
  //               mSTMaterialTypeId: [bomItem.mSTMaterialTypeId],
  //               finishGoodsProductionStageId: [prod.finishGoodsProductionStageId],
  //               scanFinishGoodsProductionStageId: [prod.scanFinishGoodsProductionStageId],
  //               mSTBOMId: [bomItem.mSTBOMId],
  //               itemName: [res.data.name],
  //               isScanable: [res.data.isScanable ?? false],
  //               supplierName: new FormControl(
  //                 { value: bomItem.supplierName, disabled: true },
  //               ),
  //             })
  //           );

  //         });
  //       }
  //     })

  //     index++;
  //   });
  //   this.alertyfy.success("Bom Item Added");
  // }


  processSelectedBomItem() {


    var index = 0;
    this.localStorageService.addSelectedBomsItems(this.bomItemIdValueArray);
    //  console.log("jshadfjhsjf=",this.bomItemIdValueArray);
    if (this.bomItemIdValueArray.length == 0) {
      this.itemsId = []
      const bomitemFormArray = this.BomForm.get('bomitemForm') as FormArray;
      bomitemFormArray.clear();

      return;

    }
    //this.itemsId = [];
    this.bomItemIdValueArray.forEach((prod) => {
                debugger;
      const bomitemFormArray = this.BomForm.get('bomitemForm') as FormArray;
      //bomitemFormArray.clear();
     var check = this.itemsId.includes(prod.itemId);
      if(!check){
        this.itemsId.push(prod.itemId);
      var bomItem = new BomDetailsItem();
      this._Service.getMstBomSupplierByMstBomId(prod.mstBomId).subscribe(res => { //For supplier Id
        if (res.status == 200) {
          bomItem.supplierName = res.data.supplierName;
          this._Service.getItemListbyitemId(prod.itemId).subscribe((res) => {
            bomItem.id = 0;
            bomItem.partNumber = prod.partNumber;
            bomItem.description = prod.description;
            bomItem.itemId = prod.itemId;
            bomItem.itemName = res.data.name;
            bomItem.unitId = prod.unitId;
            bomItem.mSTMaterialTypeId = res.data.mstMaterialTypeId;
            bomItem.mSTBOMId = prod.mstBomId;
            bomItem.FinishGoodsProductionStageId =
              prod.finishGoodsProductionStageId;
            bomItem.isScanable = res.data.isScanable ?? false;

            this.bomitems.push(bomItem);
            (this.BomForm.controls["bomitemForm"] as FormArray).push(
              this.fbInv.group({
                id: [0],
                itemId: [bomItem.itemId],
                partNumber: new FormControl(
                  { value: bomItem.partNumber, disabled: true },
                  Validators.required
                ),
                //description:[bomItem.description],
                description: new FormControl(
                  { value: bomItem.description, disabled: true },
                ),
                qunatity: [0],
                unitId: [bomItem.unitId],
                mSTMaterialTypeId: [bomItem.mSTMaterialTypeId],
                finishGoodsProductionStageId: [prod.finishGoodsProductionStageId],
                scanFinishGoodsProductionStageId: [prod.scanFinishGoodsProductionStageId],
                mSTBOMId: [bomItem.mSTBOMId],
                itemName: [res.data.name],
                isScanable: [res.data.isScanable ?? false],
                supplierName: new FormControl(
                  { value: bomItem.supplierName, disabled: true },
                ),
              })
            );

          });
        }
      })
      }

      index++;
    });
    this.alertyfy.success("Bom Item Added");
  }
  //#endregion

  //#region inventory-file

  onSelect(event) {
    this.formData = new FormData();
    this.files.push(...event.addedFiles);
    for (let i = 0; i < this.files.length; i++) {
      this.formData.append("files[]", this.files[i]);
    }
  }

  onDeleteFile(index) {
    this.alertyfy.confirm
      (
        "Are you sure you want to Remove this file?",
        () => {
          this.formData = new FormData();
          var deletedFile = this.files[index];
          this.files.splice(index, 1);
          for (let i = 0; i < this.files.length; i++) {
            this.formData.append("files[]", this.files[i]);
          }
          if (
            deletedFile != null &&
            deletedFile.id != null &&
            deletedFile.id != undefined &&
            deletedFile.id > 0
          ) {
            this.deletedFiles.push(deletedFile.id);
          }
        },
      );
  }

  getBomFiles(bomid) {
    this._Service.getALLBomFileBYBomId(bomid).subscribe((res) => {
      this.files = res;
      this.filelength = this.files.length;
    });
  }

  //ChnageLog
  getBomChangelog() {
    if (this.bomID > 0) {
      return this._Service.getChangelog(this.bomID).subscribe({
        next: (result: BomChangelogResponse) => {
          this.bomchangeloglist = result.data;
        }
      })
    }
  }

  //#endregion
  getBomById() {
    if (this.bomID > 0) {
      this._Service.getById(this.bomID).subscribe({
        next:
          (bomdata: BomResponse) => {
            this.isCreatedUser = bomdata.data.isCreatedUser;
            var _date_ = this.getNgbFormatDate(
              bomdata.data.effectiveFrom.split("T")[0]
            );
            this.EffectiveFromDate=_date_;
            this.mst_BOMStatus = bomdata.data.msT_BOMStatusName;
            if (this.mst_BOMStatus == 'Accepted') this.AcceptedStage = true;
            this.selectedFinishGoodsId = bomdata.data.mstFinishGoodsId;
            this.selectedProjectId = bomdata.data.mstProjectId;
            this.loadForm();
            this.FiniGoodsId=bomdata.data.mstFinishGoodsId;
              if(bomdata.data.isCurrentVersion)this.IsCurrentVersion=true;
          
            this.BomForm.patchValue({
              id: bomdata.data.id,
              name: bomdata.data.name,
              revisionNumber: bomdata.data.revisionNumber,
              isActive: bomdata.data.isActive,
              effectiveFrom: _date_,
              productPartNumber: bomdata.data.productPartNumber,
              ecnNumber: bomdata.data.ecnNumber,
              mstFinishGoodsId: bomdata.data.mstFinishGoodsId,
              mstProjectId: bomdata.data.mstProjectId,
              remarks: bomdata.data.remarks,
              model: bomdata.data.model,
              subRevisionNumber: bomdata.data.subRevisionNumber,
              bomitemForm: [],
              //fgBomId:bomdata.data.fgBomId,
              bomType:bomdata.data.bomType
            });
            // if(bomdata.data.bomType==BOMTypeEnum.SemiFinishGoods)
            // {
            //   this.isShowFG=true;
            //   this.BomData= this.BomData.filter(x=>x.mstFinishGoodsId==this.BomForm.value.mstFinishGoodsId && x.bomType==BOMTypeEnum.FinishGoods)

            // }
            this.getProductionStageDDL(bomdata.data.mstFinishGoodsId);
            this.getBomItems(this.bomID);
            this.getBomFiles(this.bomID);
          },
        error: (error) => {
          this.alertyfy.error(error);
          this.router.navigateByUrl("/ManageBom/list-bom");
        }
      }

      );
    }
  }

  setValue(item) {
    var id = parseInt(item.split(":")[1]);
    var val = this.FinishGoodsList.filter(x => x.id == id);
    if (val != null) {
      this.BomForm.patchValue({
        model: val[0].model,
        productPartNumber: val[0].partNumber
      });
      //this.ShowFG();
    }
  }

  onSaveDraft() {
    this.OnsaveBom(BOmStatusEnum.saveDraft);
  }

  onDiscard() {
    this.router.navigate(["/ManageBom/list-bom"]);
  }

  getProductionStageDDL(id) {
    this._Service.getProductionstageDDLbyfinishgoodId(id).subscribe({
      next: (res) => {
        this.productionstageDDL = res.data;
      }
    })
  }

  OnsaveBom(saveType) {

    // if(this.BomForm.getRawValue().bomType==BOMTypeEnum.FinishGoods && (this.BomForm.getRawValue().parentBOMId=='' ||this.BomForm.getRawValue().parentBOMId==null )){
    //   this.alertyfy.error("Please Selelct Parent Bom");
    //   return;
    // }
     //console.log(this.BomForm.value)
    // console.log(this.BomForm.valid)
    // console.log(this.BomForm.value.effectiveFrom)
    if (this.BomForm.valid) {
      const _effectiveForm =
        new Date(
          this.BomForm.value.effectiveFrom.year,
          this.BomForm.value.effectiveFrom.month - 1,
          this.BomForm.value.effectiveFrom.day
        ) || new Date();
      var _bomFormdata = this.BomForm.getRawValue();
      var bomupdate = new Bom();
      bomupdate.id = _bomFormdata.id;
      bomupdate.name = _bomFormdata.name;
      bomupdate.revisionNumber = _bomFormdata.revisionNumber;
      bomupdate.isActive = _bomFormdata.isActive;
      bomupdate.effectiveFrom = _effectiveForm;
      bomupdate.productPartNumber = _bomFormdata.productPartNumber;
      bomupdate.ecnNumber = _bomFormdata.ecnNumber;
      bomupdate.mstFinishGoodsId = _bomFormdata.mstFinishGoodsId;
      bomupdate.mstProjectId = _bomFormdata.mstProjectId;
      bomupdate.remarks = _bomFormdata.remarks;
      bomupdate.model = _bomFormdata.model;
      bomupdate.bomType = _bomFormdata.bomType;
      //bomupdate.fgBomId = _bomFormdata.fgBomId;
      bomupdate.subRevisionNumber = _bomFormdata.subRevisionNumber;
      var bombundle = {
        bomData: bomupdate,
        bomDetailItemDatas: this.BomForm.getRawValue().bomitemForm,
      };


      this._Service.UpdateBOmDetailsItem(bombundle).subscribe(

        (res) => {
          if (
            this.filelength < this.files.length ||
            this.deletedFiles.length > 0
          ) {
            this.formData.append("BomId", this.bomID);
            this.formData.append("DeletedIds", this.deletedFiles);
            this._Service.InsertBomFiles(this.formData, this.bomID).subscribe(
              (response_f) => {
                this.spinnerManager.hideSpinner();
                this.alertyfy.success("Updated Sucessfully")
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
          else {
            this.alertyfy.success("Updated Sucessfully")
            this.router.navigate(["/ManageBom/list-bom"]);
          }
        },
        (error) => {
          this.alertyfy.error(error);
          this.router.navigateByUrl("/ManageBom/list-bom");
        }
      );
    }
  }
  //-----------------------BOM approval ------------------
  OnSaveForApproval() {
    const modalRef = this.modalService.open(BOMApprovalComponent, {
      size: <any>"lg",
    });
    modalRef.componentInstance.bomId = this.bomID;
    modalRef.result
      .then((emitted) => {
        // console.log(emitted)
        if (emitted.isSavePressed) {
          // console.log(emitted.isSavePressed)
          this.getBomById();
          this.reFreshDataChild.refreshData();
        }
      })
      .catch((reason) => { });
  }
  private getNgbFormatDate(_date_) {
    var result = _date_.split("-");
    var ngbDate = {
      year: Number(result[0]),
      month: Number(result[1]),
      day: Number(result[2]),
    };
    return ngbDate;
  }
  //updated
  finalSave() {
    this.OnsaveBomFinal(BOmStatusEnum.saveDraft)
  }
  OnsaveBomFinal(saveType) {
    if (this.BomForm.valid) {
      var _bomFormdata = this.BomForm.getRawValue();
      var bomupdate = new Bom();
      bomupdate.id = _bomFormdata.id;
      var bombundle = {
        bomData: bomupdate,
        bomDetailItemDatas: this.BomForm.getRawValue().bomitemForm,
      };
      this._Service.UpdateBOmDetailsItemAfterUpdate(bombundle).subscribe(
        (res) => {
          if (res) {
            this.alertyfy.success("Updated Sucessfully")
            this.getBomById()
            //this.router.navigate(["/ManageBom/list-bom"]);
          }
        },
        (error) => {
          this.alertyfy.error(error);
          this.router.navigateByUrl("/ManageBom/list-bom");
        }
      );
    }
  }
  CreateVersion() {
    this._Service.CopyBomVersion(this.bomID).subscribe(res => {
      if (res.id > 0) {
        this.alertyfy.success("New Vesion Created")
        this.router.navigate(["/ManageBom/edit-bom/", res.id]);
      }
    })
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
  // ShowFG(){
  //   debugger;
  //   var val = this.BomForm.value.bomType;
  //   if(this.BomForm.value.bomType==BOMTypeEnum.none) return;
  //   if(this.BomForm.value.bomType==BOMTypeEnum.FinishGoods){
  //     this.isShowFG=false;
  //   }
  //   if(this.BomForm.value.bomType==BOMTypeEnum.SemiFinishGoods){
  //     if(this.BomForm.value.mstFinishGoodsId>0){
  //       this.isShowFG=true;
  //       this.BomData= this.BomData.filter(x=>x.mstFinishGoodsId==this.BomForm.value.mstFinishGoodsId && x.bomType==BOMTypeEnum.FinishGoods)
  //     }else{
  //       this.alertyfy.error("Please select finigoods");
  //     }

  //   };
  // }
}
