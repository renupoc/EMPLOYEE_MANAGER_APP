import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-back-to-home',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="back-home">
      <a routerLink="/">← Back to Home</a>
    </div>
  `,
  styles: [`
    .back-home {
      margin-bottom: 16px;
    }

    .back-home a {
      font-size: 13px;
      color: #2563eb;
      text-decoration: none;
      font-weight: 600;
    }

    .back-home a:hover {
      text-decoration: underline;
    }
  `]
})
export class BackToHomeComponent {}
