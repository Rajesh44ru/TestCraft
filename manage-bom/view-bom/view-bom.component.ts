import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Console } from 'console';
import { DateTime } from 'rrule/dist/esm/datetime';
import { DataDropDownlist } from 'src/app/shared/models/DropDown/drop-down.model';
import { FinishGoods } from 'src/app/shared/models/FinishGoods/finish-goods.model';
import { Bom, BomResponse } from 'src/app/shared/models/ManageBom/bom.model';
import { CreateResponse } from 'src/app/shared/models/Response/CreateResponse.model';
import { AlertyfyService } from 'src/app/shared/service/alertyfy.service';
import { FinishGoodsService } from 'src/app/shared/service/FinishGoods/finish-goods.service';
import { BomService } from 'src/app/shared/service/ManageBom/bom.service';
import { SpinnerManagerService } from 'src/app/shared/service/spinnerManager.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-bom',
  templateUrl: './view-bom.component.html',
  styleUrls: ['./view-bom.component.scss']
})
export class ViewBOmComponent {
baseUrl:any = environment.imageUrl;

public BomForm: FormGroup;
  dropdownListSelected:any[] = [];
  selectedItems:any[] = [];
  dropdownSettings:any = {};
  ProjectList:any;
  ItemLIst:any;
  FinishGoodsList:any;
  Id:any;
  public loading:string = environment.loadingSpinner;
  public saving:string = environment.savingSpinner;
 
  ckeConfig = {
    toolbar: [
      { name: 'tools', items: ['Maximize', 'ShowBlocks', 'Preview', 'Print', 'Templates'] },
      { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
      { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
      '/',
      { name: 'insert', items: ['Image', 'uploadFromImageLibraryButton', 'uploadFromImageLocalButton', 'Table', 'HorizontalRule', 'SpecialChar', 'Iframe', 'Embed'] },
      { name: 'document', items: ['Source'] },
      { name: 'justify', items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'] },
      '/',
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'RemoveFormat'] },
      { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', 'CreateDiv', '-', 'Blockquote'] },
      '/',
      { name: 'styles', items: ['Styles', 'Format', 'FontSize', '-', 'TextColor', 'BGColor'] },
      { name: 'editing', items: ['Scayt', 'Find', 'Replace', 'SelectAll'] },
    ],
    allowedContent: false,
    extraPlugins: 'divarea, image2, embed, embedbase',
    forcePasteAsPlainText: true,
    filebrowserUploadUrl: environment.apiUrl + 'UserDetails/uploadckimages',
    embed_provider: '//ckeditor.iframe.ly/api/oembed?url={url}&callback={callback}',
    mediaEmbed: {
      previewsInData: true
    }
  };
  constructor(private fb: FormBuilder, private route: ActivatedRoute,
    private _router: Router,
    private modalService: NgbModal,
    private alertyfy: AlertyfyService,
    private spinningManager: SpinnerManagerService,
    private _service :BomService,
    ) 
    {
    this.spinningManager.showSpinner(this.loading);
  }

  ngOnInit() {
    this.CreateBomForm();
    this.LoadProjectList();
    this.LoadFinishGoodsList();
    this.route.paramMap.subscribe(params => {
      this.Id = params.get('id');
     
      this.dropdownSettings = {
        singleSelection: false,
        idField: 'value',
        textField: 'text',
        limitSelection: 1,
        selectAllText: 'Select All',
        unSelectAllText: 'UnSelect All',
        allowSearchFilter: true,
        enableCheckAll: false
      };
      this.getBomData(this.Id);
    });
  }

  LoadFinishGoodsList(){
    this._service.loadFinishGoodsList().subscribe((res:DataDropDownlist)=>{
      this.FinishGoodsList=res;
    })
  }

  CreateBomForm() {
    this.BomForm = this.fb.group({
      id:[0],
      revisionNumber:[{value: '', disabled: true}],
      subRevisionNumber:[{value: '', disabled: true}],
      model:[{value: '', disabled: true}],
      remarks:[{value: '', disabled: true}],
      mstProjectId:[{value: '', disabled: true}],
      mstFinishGoodsId:[{value: '', disabled: true}],
      ecnNumber:[{value: '', disabled: true}],
      productPartNumber:[{value: '', disabled: true}],
      effectiveFrom:[{value: '', disabled: true}],
      isActive:[{value: '', disabled: true}],
    });
  }

  tabchange(event) {
    if (event.nextId === 'ngb-tab-0') {
    }

  }
  LoadProjectList(){
    this._service.projectList().subscribe(res=>{
      this.ProjectList=res;
    })
  }

  getBomData(id: number) {
    this._service.getById(this.Id).subscribe((bomdata: BomResponse) => {
      this.spinningManager.hideSpinner();
      if (bomdata.id === 0) {
        this.alertyfy.error('Data does not exists.');
        this._router.navigate(['/ManageBom/list-bom']);
        return;
      }
      const dbDate = bomdata.data.effectiveFrom; 
      const date = new Date(dbDate);
      const dateString = date.toISOString().substring(0, 10);

      this.BomForm.patchValue({
        revisionNumber: bomdata.data.revisionNumber,
        isActive: bomdata.data.isActive,
        effectiveFrom: dateString,
        productPartNumber: bomdata.data.productPartNumber,
        ecnNumber: bomdata.data.ecnNumber,
        mstFinishGoodsId: bomdata.data.mstFinishGoodsId,
        mstProjectId: bomdata.data.mstProjectId,
        remarks: bomdata.data.remarks,
        model: bomdata.data.model,
        subRevisionNumber: bomdata.data.subRevisionNumber,
      });
    });
  }

  onItemSelect(item:any) {
    this.dropdownListSelected.push(item.value);

  }

  onItemDeleSelect(item: any) {
    const index = this.dropdownListSelected.indexOf(item.value);
    if (index > -1) {
      this.dropdownListSelected.splice(index, 1);
    }
  }

  onSubmit() {
    if (this.BomForm.valid) {
      this.BomForm.value.id=this.Id;
      this._service.update(this.BomForm.value).subscribe((res:CreateResponse)=> {
       if(res.status==200){
        this.alertyfy.success('FinishGoods updated successfully.');
        this._router.navigate(['/ManageBom/list-bom']);
       }
      }, err => {
        this.alertyfy.error(err.error);
      });
    } else {
      this.BomForm.markAllAsTouched();
    }
  }
  
}

