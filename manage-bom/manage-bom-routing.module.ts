import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListBomComponent } from './list-bom/list-bom.component';
import { CreateBomComponent } from './create-bom/create-bom.component';
import { EditBomComponent } from './edit-bom/edit-bom.component';
import { ViewBOmComponent } from './view-bom/view-bom.component';
import { NotificationComponent } from 'src/app/shared/components/notification/notification.component';

const routes: Routes = [
{
  path:'',
  children:[
    {
      path: 'list-bom',
      component: ListBomComponent,
      data: {
        title: "Manage Bom",
        breadcrumb: "Manage Bom"
      }
      //finishGoods  nav routing
    },
    {
      path: 'notification',
      component: NotificationComponent,
      data: {
        title: "Manage Notification",
        breadcrumb: "Manage Notification"
      }
      //finishGoods  nav routing
    },
    {
      path: 'create-bom',
      component: CreateBomComponent,
      data: {
        title: "Add Bom",
        breadcrumb: "Add Bom"
      }
      //finishGoods  nav routing
    },
    {
      path: 'edit-bom/:id',
      component: EditBomComponent,
      data: {
        title: "Edit Bom",
        breadcrumb: "Edit BOm"
      }
    },
    {
      path: 'view-Bom/:id',
      component: ViewBOmComponent,
      data: {
        title: "View Bom",
        breadcrumb: "View Bom"
      }
    },


  ]
}

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ManageBomRoutingModule { }
