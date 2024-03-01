import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ManagePalletProductionRoutingModule } from './manage-pallet-production-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PalletProductionComponent } from './pallet-production/pallet-production.component';
import { ListPalletDetailsComponent } from './list-pallet-details/list-pallet-details.component';
import { UpsertPalletComponent } from './upsert-pallet/upsert-pallet.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { NgbActiveModal, NgbDatepickerModule, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SharedModule } from 'src/app/shared/shared.module';
import { ListSemiFinishGoodsPalletDetailComponent } from './SemiFinishGoodsPalletDetail/list-semi-finish-goods-pallet-detail/list-semi-finish-goods-pallet-detail.component';
import { UpsertSemiFinishGoodsPalletDetailComponent } from './SemiFinishGoodsPalletDetail/upsert-semi-finish-goods-pallet-detail/upsert-semi-finish-goods-pallet-detail.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { VerifyPalletComponent } from './verify-pallet/verify-pallet.component';


@NgModule({
  declarations: [
    PalletProductionComponent,
    ListPalletDetailsComponent,
    UpsertPalletComponent,
    ListSemiFinishGoodsPalletDetailComponent,
    UpsertSemiFinishGoodsPalletDetailComponent,
    VerifyPalletComponent,
    
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ManagePalletProductionRoutingModule,
    NgMultiSelectDropDownModule,
    NgbDatepickerModule,
    SharedModule,
    NgbModule,
    NgxDatatableModule
    


  ],
  providers: [
    NgbActiveModal,
]
})
export class ManagePalletProductionModule { }
