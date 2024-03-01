import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Managaepallte, PalletResponse } from 'src/app/shared/models/ManagePallet/managaepallte.class';
import { PalletProductionserviceService } from 'src/app/shared/service/ManagePallet/pallet-productionservice.service';
import { AlertyfyService } from 'src/app/shared/service/alertyfy.service';
import { saveAs as importedSaveAs } from 'file-saver';
import { Router } from '@angular/router';
import { SpinnerManagerService } from 'src/app/shared/service/spinnerManager.service';
import { DataPermissions } from 'src/app/shared/enums/DataPermissions';
import { ManagePermissionService } from 'src/app/shared/service/ManagePermissions/manage-permission.service';
import { environment } from 'src/environments/environment';
// import { Router } from 'express';

@Component({
  selector: 'app-pallet-production',
  templateUrl: './pallet-production.component.html',
  styleUrls: ['./pallet-production.component.scss']
})
export class PalletProductionComponent {

  public loading: string = environment.loadingSpinner;
  public saving: string = environment.savingSpinner;

  HtmlStringForPallet: any;
  renderpallet: boolean = false;
  HtmlStringForSerial: any[] = [];
  StorepalletIdToPrint: string;
  StoreSerailNumberToPrint: any[] = [];
  public dataPermission = DataPermissions;
  workOrderNumber: string;
  SerialNumber: string;
  productionplanId: number;
  serialExist: boolean = false;
  nonGeneratedSerialList: any;
  GeneratedSerialList: any;
  nullstring: string = '';
  columns = [
    { title: "Pallet ID", key: "Id", isSortable: false },
    { title: "Serial Number", key: "model", isSortable: false },

  ];
  noDataFound: string;
  public Data: any;
  public SerailNumberDataList: any[] = [];
  public SfinishGoodsidList: any[] = [];
  public showGenerate: boolean = false;
  constructor(private _service: PalletProductionserviceService,
    private spinningManager: SpinnerManagerService,
    public mps: ManagePermissionService,
    private router: Router,
    private alertyfy: AlertyfyService, public sanitizer: DomSanitizer) {

  }
  keyEventInput(evt) {
    if (evt.key == "Enter") {
      this.submitSerailInput();
    }
  }
  GeneratePallet() {
    if (this.SfinishGoodsidList.length > 0) {
      this.spinningManager.showSpinner("...Generating")
      this._service.GeneratepalletId(this.SfinishGoodsidList).subscribe({
        next: (res) => {
          if (res.status == 200) {
            this.submit(); //get new updated data
            this.SerailNumberDataList = [];
            this.SfinishGoodsidList = [];
            this.alertyfy.confirm
              (
                "PallteId Generated.",
                () => {
                  this.router.navigateByUrl('/managepallet/ListDetails/' + res.id)

                },
              );
          } if (res.status == 400) this.alertyfy.error("Something went Wrong");
          this.spinningManager.hideSpinner();
        }

      })
    }

  }

  OnDeleteSerial(idx) {
    if (idx > -1) {
      this.SerailNumberDataList.splice(idx, 1);
      this.SfinishGoodsidList.splice(idx, 1);
      if (this.SfinishGoodsidList.length < 2) this.showGenerate = false;
    }
  }
  submitSerailInput() {
    debugger;
    this.spinningManager.showSpinner(this.loading);
    if (this.SerialNumber != null) {
      this.serialExist = false;
      var dat = new Managaepallte();
      dat.productionPlanId = this.productionplanId;
      dat.serialNumber = this.SerialNumber;
      for (var i = 0; i < this.Data.length; i++) {
        for (var j = 0; j < this.Data[i].listData.length; j++) {
          var stor = this.Data[i].listData[j]
          var checkss = stor['serialNumber'];
          if (checkss == this.SerialNumber) {
            this.serialExist = true;
            break;
          }
        }

      }
      if (this.serialExist == true)
        this.checkExistaneForSerail(dat);
      if ((this.serialExist == false)) {
        this.alertyfy.error("Invalid Serial Number");
        this.spinningManager.hideSpinner();
        this.SerialNumber = '';
      }

    }
    else {
      this.alertyfy.error("please enter SerailNUmber");
      this.spinningManager.hideSpinner();
      return;
    }
  }

  checkExistaneForSerail(dat) {
    debugger;
    if (this.serialExist == true) {
      this._service.checkpalletProduction(dat).subscribe({
        next: (res) => {
          if (res.status == 200) {
            if (res.data[0]?.isExistPallet) {
              this.alertyfy.success("PalletId Exists")
              this.SerialNumber = "";
              this.spinningManager.hideSpinner();
            }
            else {
              if (this.SerailNumberDataList.length < 2) {
                var check = this.SerailNumberDataList.filter(x => x == this.SerialNumber);
                if (check.length == 0) {
                  this.SerailNumberDataList.push(this.SerialNumber)
                  this.SfinishGoodsidList.push(res.data[0].listData[0].semiGoodsFinishId)
                  this.SerialNumber = '';
                  if (this.SfinishGoodsidList.length == 2) this.showGenerate = true;
                  this.spinningManager.hideSpinner();
                } else {
                  this.alertyfy.message("Data Already  Exist");
                  this.spinningManager.hideSpinner();
                }
              }

            }
          }
          else {
            this.alertyfy.error("Something went wrong.");
            this.spinningManager.hideSpinner();
          }
        },
        error: (err) => {
          this.spinningManager.hideSpinner();
        }
      })
    } else {
      this.alertyfy.error("Invalid Serial Number");
      this.spinningManager.hideSpinner();
      this.SerialNumber = '';
    }
  }
  keypressevent(evt: any) {
    if (evt.key == "Enter") {
      this.submit();
    }
  }

  submit() {
    this.spinningManager.showSpinner(this.loading)
    this.SerailNumberDataList = [];
    this.SfinishGoodsidList = [];
    if (this.workOrderNumber != null) {
      var dat = new Managaepallte();
      dat.workOrderNumber = this.workOrderNumber;
      dat.productionPlanId = 0;
      dat.serialNumber = "";
      this._service.managePalletProduction(dat).subscribe({
        next: (res: PalletResponse) => {
          if (res.data.length > 0) {
            var data = res.data;
            this.Data = res.data;
            this.GeneratedSerialList = data.filter(x => x.isExistPallet == true);
            this.nonGeneratedSerialList = data.filter(x => x.isExistPallet == false);
            console.log(this.nonGeneratedSerialList);
            this.productionplanId = res.data[0].productionPlanId;
            this.spinningManager.hideSpinner();
          }
          else {
            this.alertyfy.success("Data Doesnot exist.");
            this.Data = [];
            this.workOrderNumber = '';
            this.spinningManager.hideSpinner();
          }
        },
        error: (err) => {
          this.spinningManager.hideSpinner();
        }
      })
    } else {
      this.alertyfy.error("please enter WorkOrderNUmber");
      this.spinningManager.hideSpinner();
      return;
    }


  }

  //Render pallet
  Render(item) {
    this.router.navigateByUrl('/managepallet/ListDetails/' + item.semiFinishGoodsPalletId)
  }

}

