import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-organization-form',
  templateUrl: './organization-form.component.html',
  styleUrls: ['./organization-form.component.scss'],
})
export class OrganizationFormComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  organizationId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      nit: ['', Validators.required],
      description: [''],
      address: [''],
      phone: [''],
      email: ['', Validators.email],
      website: [''],
    });
  }

  ngOnInit(): void {
    this.organizationId = this.route.snapshot.paramMap.get('id');
    if (this.organizationId) {
      this.isEditMode = true;
    }
  }

  onSubmit(): void {
    if (this.form.valid) {
      console.log('Save organization:', this.form.value);
      this.router.navigate(['/organizations']);
    }
  }
}
