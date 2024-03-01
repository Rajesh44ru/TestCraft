import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PalletProductionComponent } from './pallet-production/pallet-production.component';
import { ListPalletDetailsComponent } from './list-pallet-details/list-pallet-details.component';
import { ListPalletComponent } from './list-pallet/list-pallet.component';
import { UpsertPalletComponent } from './upsert-pallet/upsert-pallet.component';
import { ReworkFormComponent } from '../production-step/rework-form/rework-form.component';
import { VerifyPalletComponent } from './verify-pallet/verify-pallet.component';

const routes: Routes = [
  {
    path:'',
      children:[
        {
          path: 'steps',
          component: PalletProductionComponent,
          data: {
            title: "Production Steps",
            breadcrumb: "Production Steps"
          }
        },
        {
          path: 'ListDetails/:id',
          component: ListPalletDetailsComponent,
          data: {
            title: "Production Steps",
            breadcrumb: "ListPallets"
          }
        },
        {
          path: 'ListPallet',
          component: ListPalletComponent,
          data: {
            title: "Production Steps",
            breadcrumb: "ListPallets"
          }
        },
        {
          path: 'verify',
          component: VerifyPalletComponent,
          data: {
            title: "Verify Pallet",
            breadcrumb: "Verify Pallet"
          }
        },
        {
          path: "create-pallet",
          component: UpsertPalletComponent,
          data: {
            title: "Add Pallet",
            breadcrumb: "Add Pallet",
          },
        },
        {
          path: "edit-pallet/:id",
          component: UpsertPalletComponent,
          data: {
            title: "Edit Pallet",
            breadcrumb: "Edit Pallet",
          },
        }
      ],
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManagePalletProductionRoutingModule { }
