import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { AIChatComponent } from './ai-chat/ai-chat.component';
import { AIPolicyComponent } from './ai-policy/ai-policy.component';
import { AIGapComponent } from './ai-gap/ai-gap.component';

const routes: Routes = [
  { path: '', redirectTo: 'chat', pathMatch: 'full' },
  { path: 'chat', component: AIChatComponent },
  { path: 'policy', component: AIPolicyComponent },
  { path: 'gap', component: AIGapComponent },
];

@NgModule({
  declarations: [AIChatComponent, AIPolicyComponent, AIGapComponent],
  imports: [CommonModule, FormsModule, SharedModule, RouterModule.forChild(routes)],
})
export class AIModule {}
