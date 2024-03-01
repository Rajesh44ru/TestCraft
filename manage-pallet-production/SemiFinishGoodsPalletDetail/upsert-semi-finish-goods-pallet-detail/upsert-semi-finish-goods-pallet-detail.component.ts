import { Component, Input } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { Dropdownlist } from "src/app/shared/models/DropDown/drop-down.model";
import { SemiFinishGoodsPalletDetail } from "src/app/shared/models/ManagePallet/managaepallte.class";
import { MstProductionStage } from "src/app/shared/models/mastersetup.model";
import { Response } from "src/app/shared/models/Response/CreateResponse.model";

import { AlertyfyService } from "src/app/shared/service/alertyfy.service";
import { SemiFinisGoodPalletDetailsService } from "src/app/shared/service/ManagePallet/semi-finis-good-pallet-details.service";
import { MstProductionStageService } from "src/app/shared/service/mastersetup/mst-production-stage.service";
import { SpinnerManagerService } from "src/app/shared/service/spinnerManager.service";
import { environment } from "src/environments/environment";


@Component({
  selector: 'app-upsert-semi-finish-goods-pallet-detail',
  templateUrl: './upsert-semi-finish-goods-pallet-detail.component.html',
  styleUrls: ['./upsert-semi-finish-goods-pallet-detail.component.scss']
})
export class UpsertSemiFinishGoodsPalletDetailComponent {
 //variable declaration
 @Input() palletDetailsId: number;
 @Input() SemiFinishGoodPalletId: number;
 @Input() hideFields: boolean= false;

 upsertForm: FormGroup;
 list = [];
 Id: number = 0;
 btnSave = "Save";
 formstatus = "Create";

 ///Dropdowns
 FinishGoodsDropdown:any =[];


 ///DropDown Selected Item
 selectedFinishGoods: any;


 dropdownSettings = {};

 //spinner message
 public loading: string = environment.loadingSpinner;
 public saving: string = environment.savingSpinner;

 constructor(
   private fb: FormBuilder,
   private router: Router,
   private route: ActivatedRoute,
   private _service: SemiFinisGoodPalletDetailsService,
   private spinningManager: SpinnerManagerService,
   private alertify: AlertyfyService,
   public activeModal: NgbActiveModal

 ) {
   this.Id =
     this.route.snapshot.params.id === undefined
       ? 0
       : parseInt(this.route.snapshot.params.id);
 }

 ngOnInit(): void {
   this.loadForm();
   this.getFinishGoodDDL();
   if (this.palletDetailsId > 0) {
    this.Id = this.palletDetailsId;
  }
   if (this.Id > 0) {
     this.edit();
   }
   this.dropdownSettings = {
     singleSelection: true,
     idField: "id",
     textField: "name",
     selectAllText: "Select All",
     unSelectAllText: "UnSelect All",
     itemsShowLimit: 3,
     allowSearchFilter: true,
     enableCheckAll: false,
   };
   this.spinningManager.hideSpinner();
 }

 //form loaded
 loadForm() {
   this.upsertForm = this.fb.group({
     id: 0,
     semiFinishGoodsPalletId: this.SemiFinishGoodPalletId,
     semiFinishGoodsId: [""],
     serialNumber: [""],
     remarks: [""],
     isActive: [true],
   });
 }
 //getting controls of UpsertForm
 get UpsertFromControl() {
   return this.upsertForm.controls;
 }

 //edit functionality
 edit() {
   this._service.getById(this.Id).subscribe({
     next: (result: SemiFinishGoodsPalletDetail) => {
       this.spinningManager.showSpinner(this.loading);
      //  this.gettypeId(result.data.msT_ProductionStageTypeId);
       this.upsertForm.patchValue({
        semiFinishGoodsPalletId: result.data.semiFinishGoodsPalletId,
        semiFinishGoodsId: result.data.semiFinishGoodsId,
        serialNumber: result.data.serialNumber,
        remarks: result.data.remarks,
         isActive: result.data.isActive,
       });
       this.btnSave = "Update";
       this.formstatus = "Edit";
     },
     error: (error) => {
       this.alertify.error(error.error);
       this.router.navigateByUrl("/mastersetup/list-production-stage");
     },
   });
   this.spinningManager.hideSpinner();
 }

 //saving functionality
 onSubmit() {
   if (this.upsertForm.invalid) {
     // Mark all form controls as touched to show validation errors
     this.upsertForm.markAllAsTouched();
     return;
   }
   if (this.Id && this.Id > 0) {
     this.upsertForm.value.id = this.Id;
     this.upsertForm.value.semiFinishGoodsId = this.selectedFinishGoods;

     this._service.update(this.upsertForm.value).subscribe({
       next: (result: Response) => {
         this.spinningManager.showSpinner(this.saving);
         this.alertify.success("Updated Successfully.");
         this.activeModal.close('Ok click')

         this.spinningManager.hideSpinner();
       },
       error: (error) => {
         this.spinningManager.hideSpinner();
       },
     });
   } else {
     this.upsertForm.value.semiFinishGoodsId = this.selectedFinishGoods;

     this._service.create(this.upsertForm.value).subscribe({
       next: (res) => {
         if (res) {
           this.upsertForm.reset();
           this.alertify.success("Saved Successfully.");
           this.activeModal.close('Ok click')

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
     this.router.navigateByUrl("/mastersetup/list-production-stage");
   };
 }

 ////Here are the drop dowen method
 ///for dropdown
 onFinishGoodSelect(item:any){
  this.selectedFinishGoods = item.id
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
            name: this.FinishGoodsDropdown.find((a) => a.id == id).name,
          },
        ],
      });
    }
    this.spinningManager.hideSpinner();
  });
}
}
