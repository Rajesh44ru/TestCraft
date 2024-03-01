import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManageBomRoutingModule } from './manage-bom-routing.module';
import { CreateBomComponent } from './create-bom/create-bom.component';
import { ListBomComponent } from './list-bom/list-bom.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CKEditorModule } from 'ng2-ckeditor';
import { SharedModule } from 'src/app/shared/shared.module';
import { EditBomComponent } from './edit-bom/edit-bom.component';
import { BomDialogComponent } from './bom-dialog/bom-dialog.component';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ViewBOmComponent } from './view-bom/view-bom.component';
import { BOMApprovalComponent } from './bomapproval/bomapproval.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgSelectModule } from '@ng-select/ng-select';


@NgModule({
  declarations: [
    CreateBomComponent,
    ListBomComponent,
    EditBomComponent,
    ViewBOmComponent,
    BomDialogComponent,
    BOMApprovalComponent,
    
  ],
  imports: [
    CommonModule,
    ManageBomRoutingModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    CKEditorModule,
    SharedModule,
    NgxDropzoneModule,
    NgSelectModule,
    NgMultiSelectDropDownModule.forRoot()
  ]
})
export class ManageBomModule { }
