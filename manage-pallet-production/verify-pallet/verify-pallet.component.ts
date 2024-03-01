import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Cell } from 'ng2-smart-table';
import { DataPermissions } from 'src/app/shared/enums/DataPermissions';
import { PalletProductionserviceService } from 'src/app/shared/service/ManagePallet/pallet-productionservice.service';
import { ManagePermissionService } from 'src/app/shared/service/ManagePermissions/manage-permission.service';
import { AlertyfyService } from 'src/app/shared/service/alertyfy.service';
import { SpinnerManagerService } from 'src/app/shared/service/spinnerManager.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-verify-pallet',
  templateUrl: './verify-pallet.component.html',
  styleUrls: ['./verify-pallet.component.scss']
})
export class VerifyPalletComponent {

  
   //variable declaration
   public dataList:any;
   public dataPermission = DataPermissions;
   public submitted:boolean = false;
   public palletIDNumber:any = '';

   public isPalletScanned:boolean = false;
   public isCompleted:boolean = false;
   public isAllScanned:boolean = false;

   public palletId:string ;
   public serialNumber:string;



   public isPassedPalletNumber:boolean ;

   public mlList:any = [1,2,3];
   public scannedData:any;
   public isDataExists:boolean = false;
   public isOpen:boolean = false;
   public serialList:any;
   public allScannedList:any;
  
 
   public loading:string = environment.loadingSpinner;
   public saving:string = environment.savingSpinner;
   public noDataFound: string = environment.noDataFound;


   constructor(
    private alertyfy: AlertyfyService,
    private route: Router,
    private spinningManager: SpinnerManagerService,
    public mps: ManagePermissionService,
    private _service:PalletProductionserviceService,
  ) {
   //  this.spinningManager.showSpinner(this.loading);
    this.noDataFound = environment.noDataFound;
  }


  ngOnInit() {
   }

   scanpallet(){
    this.spinningManager.showSpinner(this.loading);
    this._service.scanpallet(this.palletIDNumber).subscribe({next:(res)=>{
      if(res.status == 200 && res.data != null){
        this.dataList = res.data;
        if(res.data.serialNumberIsverifiedDTO.length==0 && res.data.isScan  && !res.data.isVerified)
        {
          this.CompletePopUp(false)
          this.isOpen=false;
          this.isPalletScanned=false;
        }
        else{ 
         var check = res.data.serialNumberIsverifiedDTO.filter(x=>x.isVerified==false)
          if(check.length>0){
            this.isPalletScanned = true;
            this.isOpen = true;
          }else if(!this.dataList.isVerified){
            this.CompletePopUp(true);
          }else{
            this.alertyfy.success("Pallet Is verified and Completed")
            this.isPalletScanned = true;
            this.isOpen = true;
          }
        }
        this.spinningManager.hideSpinner();
      }else{
        this.alertyfy.error("Invalid Pallet Number");
        this.spinningManager.hideSpinner();
      }
    },
  error:(err)=>{
    this.alertyfy.error(err.message);
    this.spinningManager.hideSpinner();
  }})
  //}
 }

 verifySerialNumber(){
  this.spinningManager.showSpinner(this.loading);
  var check = this.dataList.serialNumberIsverifiedDTO.filter(x => x.serialNumber == this.serialNumber);
  if(check.length > 0 && check[0].isVerified) {
    this.alertyfy.success(`${this.serialNumber} is already verified.`);
    this.spinningManager.hideSpinner();
    return;
  }
  if(check.length == 0) {
    this.alertyfy.error("Invalid Serial Number");
    this.spinningManager.hideSpinner();
    return;
  }

  var body ={
    "palletId": this.palletIDNumber,
    "serialNumber": this.serialNumber
  }
  this._service.scanSerialNumber(body).subscribe({next:(res)=>{
    if(res.status == 200 && res.data != null){
      this.dataList = res.data.manageData;
      var check =res.data.manageData.serialNumberIsverifiedDTO.filter(x=>x.isVerified==false)
      if(!(check.length>0))this.CompletePopUp(true);
      this.spinningManager.hideSpinner();
    }else{
      this.alertyfy.error("Invalid Serial Number");
      this.spinningManager.hideSpinner();
    }
  }})
 }
 CompletePopUp(hasSerialnumber:boolean){
  if(hasSerialnumber){
        this.alertyfy.confirm
      (
        "All the Serial Numbmber is Verified.Do You Want Verified and Complete?",
        () => {
          this.spinningManager.showSpinner(this.loading);
          this._service.CompletePalletProcess(this.palletIDNumber).subscribe({next:(res)=>{
            if(res.status == 200 && res.data.isVerified){
              this.dataList = res.data;
              this.spinningManager.hideSpinner();
              this.alertyfy.success("Verification Completed")
              this.isPalletScanned = true;
              this.isOpen = true;
            }else{
              this.alertyfy.error("Something went Wrong");
              this.spinningManager.hideSpinner();
            }
          },
        error:(err)=>{
          this.alertyfy.error(err.message);
          this.spinningManager.hideSpinner();
        }})
        },
      );
  }else{
    this.alertyfy.confirm
    (
      "Pallet Is Scan.Do You Want Verified and  complete?",
      () => {
        this._service.CompletePalletProcess(this.palletIDNumber).subscribe({next:(res)=>{
          if(res.status == 200 && res.data.isVerified){
            this.dataList = res.data;
            this.spinningManager.hideSpinner();
            this.alertyfy.success("Verification Completed")
            this.isPalletScanned = true;
            this.isOpen = true;
          }else{
            this.alertyfy.error("Something went Wrong");
            this.spinningManager.hideSpinner();
          }
        },
      error:(err)=>{
        this.alertyfy.error(err.message);
        this.spinningManager.hideSpinner();
      }})
      },
    );
  }
 }

 closeScanpallet(){
  this.isOpen = false;
  this.isPalletScanned = false;
  this.palletIDNumber = '';
  this.serialNumber = '';
 }


 Complete(){
  this.isOpen = false;
 }
}
