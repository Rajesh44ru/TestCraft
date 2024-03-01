import { Component } from '@angular/core';
import { PalletProductionserviceService } from 'src/app/shared/service/ManagePallet/pallet-productionservice.service';
import { saveAs as importedSaveAs } from 'file-saver';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { AlertyfyService } from 'src/app/shared/service/alertyfy.service';

@Component({
  selector: 'app-list-pallet-details',
  templateUrl: './list-pallet-details.component.html',
  styleUrls: ['./list-pallet-details.component.scss']
})
export class ListPalletDetailsComponent {
  PalletId: any;
  HtmlStringForPallet: any;
  renderpallet: boolean = false;
  HtmlStringForSerial: any[] = [];
  FiniGoodsIdForSerialnumber: any[] = [];
  SerailNumberDataList: any[] = [];
  PalletName: string;
  constructor(private _service: PalletProductionserviceService,
    private route: ActivatedRoute,
    public sanitizer: DomSanitizer,
    private alertyfy: AlertyfyService) {

  }
  ngOnInit() {
    this.route.paramMap.subscribe(
      (params) => {
        this.PalletId = Number(params.get("id"));
        if (this.PalletId != null) this.Render(this.PalletId)
      },
      (error) => { }
    );
  }
  Render(Id) {
    this._service.GetDataForPallet(Id).subscribe(res => {
      if (res.status == 200) {
        this.renderpallet = true;
        this.HtmlStringForPallet = this.sanitizer.bypassSecurityTrustHtml(res.data);
        //fetching serail number
        this._service.GetSerialNumberDataForpallet(this.PalletId).subscribe(res => {
          if (res.status == 200) {
            this.PalletName = res.data[0].palletName;
            this.SerailNumberDataList = res.data;
            res.data.forEach(element => {
              this._service.GetDataForSerail(element.id).subscribe(res => {
                if (res.status == 200) {
                  var sto = this.sanitizer.bypassSecurityTrustHtml(res.data);;
                  var StoId = res.id
                  this.FiniGoodsIdForSerialnumber.push(StoId)
                  this.HtmlStringForSerial.push(sto)
                }
              })
            });
          }
        })
      }
    })
  }

  //for print Both Pallet and Serail
  // printALL(){
  // //console.log("printToData",this.FiniGoodsIdForSerialnumber)
  // this.printPallet()
  // }

  printALL() {
    this._service.PrintPalletLabel(this.PalletId).subscribe(async (res: Blob) => {
      if (res.type == "application/json") {
        var json = JSON.parse(await res.text());
        this.alertyfy.success("Printed Sucessfully ")
      } else {
        var name = "Pallet_" + this.PalletName + '.pdf';
        importedSaveAs(res, name);
      }
    });
    //  for(var i=0;i<this.FiniGoodsIdForSerialnumber.length;i++){
    //   this.PrintSerailNumber(this.FiniGoodsIdForSerialnumber[i],i)
    //  }
  }

  PrintSerailNumber(SemifingoodsId, i) {
    var name = "Serial_" + this.SerailNumberDataList[i].serialNumber + '.pdf';
    this._service.PrintMaterailLabel(SemifingoodsId).subscribe(async (res: Blob) => {
      if (res.type == "application/json") {
        var json = JSON.parse(await res.text());
      } else {
        importedSaveAs(res, name);
      }
    });
  }
}
