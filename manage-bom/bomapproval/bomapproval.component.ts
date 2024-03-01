import { Component, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { DropArgument } from 'net';
import { DataDropDownlist, Dropdownlist } from 'src/app/shared/models/DropDown/drop-down.model';
import { CreateResponse } from 'src/app/shared/models/Response/CreateResponse.model';
import { BomService } from 'src/app/shared/service/ManageBom/bom.service';
import { AlertyfyService } from 'src/app/shared/service/alertyfy.service';
import { SpinnerManagerService } from 'src/app/shared/service/spinnerManager.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-bomapproval',
  templateUrl: './bomapproval.component.html',
  styleUrls: ['./bomapproval.component.scss']
})
export class BOMApprovalComponent {
  dropdownSettings:any = {};
  approversdropdownSettings:any = {};
  userSelectedItems:any[] = [];
  roleSelectedItems:any[] = [];
  userListItems:any;
  roleListItems:any;
public BOMApprovalForm: FormGroup;
 
@Input() bomId ;
boxDataList:any;
userListSelected:any[]=[];
roleListSelected:any[]=[];
public formData: FormData;
public files: any = [];
deletedFiles: any = [];
baseUrlForImage = environment.imageUrl;
Userlist:any=[];
mstApprovalEventList:any;
  constructor(public activeModal: NgbActiveModal,
    private alertify:AlertyfyService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private _Service: BomService,
    private spinnerManager: SpinnerManagerService
    ) 
  {
   
    
  }
  ngOnInit() {
    this.CreateBomApprovalForm();
    this.getAllApprovalEvent();
    
    this.approversdropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      // limitSelection: 1,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      enableCheckAll: false
    };
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      // limitSelection: 1,
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
      enableCheckAll: false
    };
    this.getAlluserList();
    this.getAllRoleList();
  
    
  }

  
     //On User Selection dropdown related
     onUserItemSelect(item:any) {
       this.roleSelectedItems = [];
       this.userListSelected.splice(0, 1);
      this.userListSelected.push(item.id);
  
    }
  
    //On User Selection dropdown related
    onUserItemDeleSelect(item: any) {
      const index = this.userListSelected.indexOf(item.id);
      if (index > -1) {
        this.userListSelected.splice(index, 1);
      }
    }

     //On Role Deselection dropdown related
     onRoleItemSelect(item:any) {
       this.userSelectedItems = [];
      this.roleSelectedItems.push(item.id);
      // for(var i=0;i<this.roleListSelected.length;i++){
      //   this.roleListSelected.splice(i,1);
      // }
    }
  
    //On Role Deselection dropdown related
    onRoleItemDeleSelect(item: any) {
      const index = this.roleSelectedItems.indexOf(item.id);
      if (index > -1) {
        this.roleSelectedItems.splice(index, 1);
      }
    }



  CreateBomApprovalForm() {
    this.BOMApprovalForm = this.fb.group({
      id:[0],
      remarks:['',Validators.required],
      mstApprovalEventId:[0,Validators.required],
      relatedFileUrl:[''],
      fileType:[''],
      fileName:[''],
      bomId:[''],
      assignedToIds:[],
      assignedToRoleIds:[],
    });
  }

  //On select File
  onSelect(event) {
    this.formData = new FormData();
    this.files.push(...event.addedFiles);
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].type != undefined) {
        this.formData.append('files[]', this.files[i]);
      }
    }
  }

  //On Deleting the file
  onDeleteFile(index) {
    // this.formData.delete('files[]');
    this.formData = new FormData();
    var deletedFile = this.files[index];
    this.files.splice(index, 1);
    for (let i = 0; i < this.files.length; i++) {
      if (this.files[i].type != undefined) {
        this.formData.append('files[]', this.files[i]);
      }
    }
    if (deletedFile != null && deletedFile.id != null && deletedFile.id != undefined && deletedFile.id > 0) {
      this.deletedFiles.push(deletedFile.id);
    }
  }

  //ApprovalEvent Dropdown data
  getAllApprovalEvent(){
    this._Service.GetAllApprovalEventListDDl().subscribe(
    {
      next:(res:DataDropDownlist)=>
      {
      this.mstApprovalEventList=res.data;
      }
    }
    )
  }

  //User Dropdown data
  getAlluserList(){
    this._Service.UserDDL().subscribe(
      {
        next:(res:Dropdownlist)=>
        {
         this.userListItems = res.data;
        }
      }
    )
  }

  //User Dropdown data
  getAllRoleList(){
    this._Service.RoleDDL().subscribe(
      {
        next:(res:Dropdownlist)=>
        {
         this.roleListItems = res.data;
        }
      }
    )
  }

  onSubmit(){
    this.spinnerManager.showSpinner("...Saving...");
    // console.log(this.BOMApprovalForm.value)
    //this.formData = new FormData();
    if(this.files.length > 0)
    {
      var userid = 0;
      var roleid = 0;
      if(this.userSelectedItems.length > 0) userid = this.userSelectedItems[0].id;
      if(this.roleSelectedItems.length > 0) roleid = this.roleSelectedItems[0].id;
      if (this.BOMApprovalForm.valid) {
        this.BOMApprovalForm.value.bomId=this.bomId;
        this.formData.append('BomId',this.bomId);
        this.formData.append('assignedToIds', userid.toString());
        this.formData.append('assignedToRoleIds', roleid.toString());
        this.formData.append('remarks',this.BOMApprovalForm.value.remarks)
        this.formData.append('mstApprovalEventId',this.BOMApprovalForm.value.mstApprovalEventId);
        this._Service.createBOMApprovalLog(this.formData).subscribe({next:(res)=>{
          
          if(res){
            this.spinnerManager.hideSpinner();
            this.activeModal.close({ 'isSavePressed': true});
            this.spinnerManager.hideSpinner();
          }else this.spinnerManager.hideSpinner();
        },
        error:(err)=>{
          this.spinnerManager.hideSpinner();
        }})
         }
         else {
          this.spinnerManager.hideSpinner();
          this.BOMApprovalForm.markAllAsTouched();
        }
    }else{
      var userid = 0;
      var roleid = 0;
      if(this.userSelectedItems.length > 0) userid = this.userSelectedItems[0].id;
      if(this.roleSelectedItems.length > 0) roleid = this.roleSelectedItems[0].id;

      // this.alertify.message("No File Uploaded");
      if (this.BOMApprovalForm.valid) {
        this.BOMApprovalForm.value.bomId=this.bomId;
        this.formData.append('BomId',this.bomId);
        // this.formData.append('eventTo',this.userListSelected[0]);
        this.formData.append('remarks',this.BOMApprovalForm.value.remarks)
        this.formData.append('assignedToIds', userid.toString());
        this.formData.append('assignedToRoleIds', roleid.toString());
        this.formData.append('mstApprovalEventId',this.BOMApprovalForm.value.mstApprovalEventId)
        this._Service.createBOMApprovalLogWithOutFile(this.formData).subscribe({next:(res)=>{
          if(res){
            this.spinnerManager.hideSpinner();
            this.activeModal.close({ 'isSavePressed': true});
          }else this.spinnerManager.hideSpinner();
        },
      error:(err)=>{
        this.spinnerManager.hideSpinner();
      }})
         }
         else {
          this.spinnerManager.hideSpinner();
          this.BOMApprovalForm.markAllAsTouched();
        }
    }
  }
}
