import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { RecentlyViewedComponent } from './recently-viewed.component';

@NgModule({
  declarations: [RecentlyViewedComponent],
  imports: [CommonModule, RouterModule],
  exports: [RecentlyViewedComponent],
})
export class RecentlyViewedModule {}
