import { Component, OnChanges, SimpleChanges } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbDateStruct } from "@ng-bootstrap/ng-bootstrap";
import { Dropdownlist } from "src/app/shared/models/DropDown/drop-down.model";
import { LocationModal } from "src/app/shared/models/location-modal.model";
import { palletList } from "src/app/shared/models/ManagePallet/managaepallte.class";
import { MstProductionStageType } from "src/app/shared/models/mastersetup.model";
import { Response } from "src/app/shared/models/Response/CreateResponse.model";
import { AlertyfyService } from "src/app/shared/service/alertyfy.service";
import { PalletProductionserviceService } from "src/app/shared/service/ManagePallet/pallet-productionservice.service";
import { MstProductionStageTypeService } from "src/app/shared/service/mastersetup/mst-production-stage-type.service";
import { SpinnerManagerService } from "src/app/shared/service/spinnerManager.service";
import { environment } from "src/environments/environment";
import { saveAs as importedSaveAs } from 'file-saver';
import { ManagePermissionService } from "src/app/shared/service/ManagePermissions/manage-permission.service";
import { DataPermissions } from "src/app/shared/enums/DataPermissions";
@Component({
  selector: 'app-upsert-pallet',
  templateUrl: './upsert-pallet.component.html',
  styleUrls: ['./upsert-pallet.component.scss']
})
export class UpsertPalletComponent{
//variable declaration
upsertForm: FormGroup;
list = [];
typeIdDropdown: any = [];
Id: number = 0;
btnSave = "Save";
formstatus = "Create";
FormInvalid:boolean = false;
ShowItemTransaction:boolean=false;
hideFields:boolean = false;
isEdit:number = 0;

 ///Dropdowns
 FinishGoodsDropdown:any =[];
 ItemDropdown:any =[];
 PalletDropdown:any =[];
 WarehouseDropdown:any =[];
 WarehouseLocationDropdown:any =[];
 WarehouseSubLoactionDropdown:any =[];
 ProductionPlanDropdown:any =[];
 ParentDropdown:any =[];

 ///DropDown Selected Item
 selectedFinishGoods: any;
 selectedItem: any;
 FiniGoodsIdForSerialnumber:any;
 SerialNumber:any;
 PalletName:any;
 selectedPallet: any;
 selectedProductionPlan: any;
 selectedParent: any;
 dropdownSettings = {};
 ProductionDropdownSettings = {};
 PalletdropdownSettings = {};
 public dataPermission = DataPermissions;



 location: LocationModal = {
  warehouseName: "Warehouse",
  subInventoryName: "Sub Inventory",
  LocationName: "Location",
  subLocationName: "Sub Location",
};
//spinner message
public loading: string = environment.loadingSpinner;
public saving: string = environment.savingSpinner;

constructor(
  private fb: FormBuilder,
  private router: Router,
  private route: ActivatedRoute,
  private _service:PalletProductionserviceService ,
  private spinningManager: SpinnerManagerService,
  private alertify: AlertyfyService,
  public mps: ManagePermissionService

) {
  this.Id =
    this.route.snapshot.params.id === undefined
      ? 0
      : parseInt(this.route.snapshot.params.id);
}





ngOnInit(): void {
  this.loadForm();

  this.dropdownSettings = {
    singleSelection: true,
    idField: "id", // Make sure 'idField' is set to the appropriate identifier field of your dropdown item
    textField: "name",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    itemsShowLimit: 3,
    allowSearchFilter: true,
    enableCheckAll: false,
  };
 
  this.PalletdropdownSettings = {
    singleSelection: true,
    idField: "id",
    textField: "name",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    itemsShowLimit: 3,
    allowSearchFilter: false,
    enableCheckAll: false,
  };
  this.ProductionDropdownSettings = {
    singleSelection: true,
    idField: "id",
    textField: "workOrderNumber",
    selectAllText: "Select All",
    unSelectAllText: "UnSelect All",
    itemsShowLimit: 3,
    allowSearchFilter: true,
    enableCheckAll: false,
  };
  this.getPalletDDl();
  this.getProductionplanDDl();
  this.getItemDDl();
   
  if (this.Id > 0) {
    this.isEdit =1;
    this.edit();
  }
  this.spinningManager.hideSpinner();
}


//form loaded
loadForm() {
  this.upsertForm = this.fb.group({
    id: 0,
    mstFinishGoodsId: [""],
    itemId: [""],
    palletId: [""],
    currentWareHouseId: [null],
    currentWareHouseLocationId: [null],
    currentWareHouseSubLocationId: [null],
    currentSubInventoryId: [null],
    productionPlanId: [""],
    parentId: [""],
    partNumber: [""],
    rohs: [""],
    quantity: [""],
    description: [""],
    isActive: [true],
    mstPalletTypeId:[""]
  });
}
//getting controls of UpsertForm
get UpsertFromControl() {
  return this.upsertForm.controls;
}
locationData(data) {
  // console.log(data);
  
  this.upsertForm.patchValue({
    currentWareHouseId: data.warehouseId,
    currentWareHouseLocationId: data.warehouseLocationId,
    currentWareHouseSubLocationId: data.warehouseSubLocationId,
    currentSubInventoryId: data.subInventoryId,
  });
}

//edit functionality
edit() {
  this._service.getById(this.Id).subscribe({
    next: (result: palletList) => {
      this.spinningManager.showSpinner(this.loading);
      this.getFinishGoodDDL(result.data.mstFinishGoodsId);
      this.getPalletDDl(result.data.mstPalletTypeId);
      if(result.data.mstFinishGoodsId != null){
        this.hideFields = true;
      }
      this.getProductionplanDDl(result.data.productionPlanId);
      if(result?.data?.parentId > 0) {
        //this.getParentDDl(result.data.parentId);
        this.upsertForm.patchValue({
          parentId: [
            {
              id: result?.data?.parentId,
              name: result?.data?.parentName,
            },
          ],
        });
      }
      this.getItemDDl(result.data.itemId);
    
      this.upsertForm.patchValue({
        currentWareHouseId: result.data.currentWareHouseId,
        currentSubInventoryId: result.data.currentSubInventoryId,
        currentWareHouseLocationId: result.data.currentWareHouseLocationId,
        currentWareHouseSubLocationId: result.data.currentWareHouseSubLocationId,
        partNumber: result.data.partNumber,
        rohs: result.data.rohs,
        quantity: result.data.quantity,
        description: result.data.description,
        isActive: result.data.isActive,
      });
      this.FiniGoodsIdForSerialnumber=result.data.mstFinishGoodsId;
      this.PalletName=result.data.palletId;
      this.ShowItemTransaction=true;
      this.SerialNumber=result.data.serialNos;
      this.btnSave = "Update";
      this.formstatus = "Edit";
    },
    error: (error) => {
      this.alertify.error(error.error);
      this.router.navigateByUrl("/managepallet/ListPallet");
    },
  });
  this.spinningManager.hideSpinner();
}

 print(){
  this._service.PrintPalletLabel(this.Id).subscribe(async (res: Blob) => {
    if(res.type=="application/json"){
      var json = JSON.parse(await res.text());
      this.alertify.success("Printed Sucessfully ")
    }else{
      var name ="Pallet_"+this.PalletName+'.pdf';
      importedSaveAs(res, name);
    }
  });
//this.PrintSerailNumber(this.FiniGoodsIdForSerialnumber)
 
}

  PrintSerailNumber(SemifingoodsId){
  var name ="Serial_"+this.SerialNumber+'.pdf';
   this._service.PrintMaterailLabel(SemifingoodsId).subscribe(async (res: Blob) => {
    if(res.type=="application/json"){
      var json = JSON.parse(await res.text());
    }else{
     importedSaveAs(res, name);
    }
   });
 } 

//saving functionality
onSubmit() {


  if (this.upsertForm.invalid) {
    // Mark all form controls as touched to show validation errors
    this.FormInvalid = true;
    return;
  }
  
  if (this.Id && this.Id > 0) {
    this.upsertForm.value.id = this.Id;
    this.upsertForm.value.mstFinishGoodsId=  this.selectedFinishGoods;
    this.upsertForm.value.mstPalletTypeId=  this.selectedPallet;
    this.upsertForm.value.productionPlanId=  this.selectedProductionPlan;
    this.upsertForm.value.parentId=  this.selectedParent;
    this.upsertForm.value.itemId=  this.selectedItem;

    this._service.update(this.upsertForm.value).subscribe({
      next: (result: Response) => {
        this.spinningManager.showSpinner(this.saving);
        this.alertify.success("Updated Successfully.");
        this.router.navigateByUrl("/managepallet/edit-pallet/"+result.id);
        this.spinningManager.hideSpinner();
      },
      error: (error) => {
        this.spinningManager.hideSpinner();
      },
    });
  } else {
    this.upsertForm.value.mstFinishGoodsId=  this.selectedFinishGoods;
    this.upsertForm.value.mstPalletTypeId=  this.selectedPallet;
    this.upsertForm.value.productionPlanId=  this.selectedProductionPlan;
    this.upsertForm.value.parentId=  this.selectedParent;
    this.upsertForm.value.itemId=  this.selectedItem;
    // console.log(this.upsertForm.value);
    
    this._service.create(this.upsertForm.value).subscribe({
      next: (res) => {
        if (res) {
          this.upsertForm.reset();
          this.alertify.success("Saved Successfully.");
          this.router.navigateByUrl(
            "/managepallet/edit-pallet/"+res.id
          );
          this.spinningManager.hideSpinner();
        }
      },
      error: (error) => {
        this.alertify.error(error);
        this.spinningManager.hideSpinner();
      },
    });
  }
  (error) => {
    this.spinningManager.hideSpinner();
    this.router.navigateByUrl("/managepallet/ListPallet");
  };
}
////Here are the drop dowen method
  ///for dropdown
  onFinishGoodSelect(item:any){
    this.selectedFinishGoods = item.id
  }
  onItemSelect(item:any){
    this.selectedItem = item.id
    this.getItemById(item.id)

  }
  onPalletSelect(item:any){
    this.selectedPallet = item.id

    if(item.id == 1){
      this.hideFields = false;
    }
    else{
      this.hideFields = true;
      this.getFinishGoodDDL();
      this.getParentDDl();  
    }
  }

  onProductionPlanSelect(item:any){
    this.selectedProductionPlan = item.id
  }
  onParentSelect(item:any){
    this.selectedParent = item.id
  }

getFinishGoodDDL(id?: number) {

  this.spinningManager.showSpinner(this.loading);
  this._service.getFinishGoodDDL().subscribe((res: Dropdownlist) => {
    this.FinishGoodsDropdown = res.data;

    if (id) {
      this.selectedFinishGoods = id;


      this.upsertForm.patchValue({
        mstFinishGoodsId: [
          {
            id: id,
            name: this.FinishGoodsDropdown?.find((a) => a.id == id)?.name,
          },
        ],
      });
    }
    this.spinningManager.hideSpinner();
  });
}
getItemDDl(id?: number) {
  this.spinningManager.showSpinner(this.loading);
  this._service.getItemIdDDL().subscribe((res) => {
    this.ItemDropdown = res.data;
    if (id) {
      this.selectedItem = id;
      this.upsertForm.patchValue({
        itemId: [
          {
            id: id,
            name: this.ItemDropdown?.find((a) => a.id == id)?.name,
          },
        ]
      });
    }
    this.spinningManager.hideSpinner();
  });
}

getPalletDDl(id?: number){
  this.spinningManager.showSpinner(this.loading);
  this._service.getPalletDDL().subscribe((res: Dropdownlist) => {
    this.PalletDropdown = res.data;
    if (id) {
      this.selectedPallet = id;
      this.upsertForm.patchValue({
        mstPalletTypeId:[
          {
            id: id,
            name: this.PalletDropdown?.find((a) => a.id == id)?.name,
          },
        ],
      });
    }
    this.spinningManager.hideSpinner();
  });
}

getProductionplanDDl(id?:number){
  this.spinningManager.showSpinner(this.loading);
  this._service.getProductionPlanDDL().subscribe((res: Dropdownlist) => {
    this.ProductionPlanDropdown = res.data;
    if (id) {
      this.selectedProductionPlan = id;
      this.upsertForm.patchValue({
        productionPlanId: [
          {
            id: id,
            workOrderNumber: this.ProductionPlanDropdown?.find((a) => a.id == id)?.workOrderNumber,
          },
        ],
      });
    }
    this.spinningManager.hideSpinner();
  });
}
getParentDDl(id?:number){
  this.spinningManager.showSpinner(this.loading);
  this._service.getParentDDL().subscribe((res: Dropdownlist) => {
    this.ParentDropdown = res.data;
    if (id) {
      this.selectedParent = id;

      this.upsertForm.patchValue({
        parentId: [
          {
            id: id,
            name: this.ParentDropdown?.find((a) => a.id == id)?.name,
          },
        ],
      });
    }
    this.spinningManager.hideSpinner();
  });
}
getItemById(id:number){
  this._service.getItemById(id).subscribe((res)=>{
    // console.log(res);
    this.upsertForm.patchValue({
      partNumber:res.data.partNumber,
      currentWareHouseId: res.data.defaultWareHouseId,
      currentWareHouseLocationId: res.data.defaultWareHouseLocationId,
      currentWareHouseSubLocationId: res.data.defaultWareHouseSubLocationId,
      currentSubInventoryId: res.data.defaultSubInventoryId,
    });
  })
}

}
