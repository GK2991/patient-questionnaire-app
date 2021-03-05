import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../app/services/api-service.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent implements OnInit {
  questionnaireForm: FormGroup;
  dynamicFormArr: any;
  submitted = false;
  questionnaireResponse = {
    resourceType : 'QuestionnaireResponse',
    identifier : {},
    basedOn : [{}],
    partOf : [{}],
    questionnaire : {},
    status : '',
    subject : {},
    encounter : {},
    authored : '',
    author : {},
    source : {},
    item : []
  };

  constructor(
    private apiService: ApiService,
    private fb: FormBuilder
  ) {  }

  ngOnInit(): void {
    this.questionnaireForm = this.fb.group({});
    this.apiService.getQuestionnaire().subscribe((data: any) => {
      this.dynamicFormArr = data.item; // create dynamic Form using json
      this.createFormGroup();
    });
  }

  createFormGroup() {
    let control: any;
    this.dynamicFormArr.forEach((ele: any) => {
      if (ele.type === 'group') {
        const grpControl = ele.item.map((val: any) => {
          return this.createFormontrol(val);
        });
        control = new FormArray(grpControl);
      } else {
        control = this.createFormontrol(ele);
      }
      this.questionnaireForm.addControl(ele.id, control); // create Form controls and Form Array and add it to the Form Group
    });
  }

  createFormontrol(value) {
    return value.required ? new FormControl('', [Validators.required]) : new FormControl('');
  }

  onSubmit() {
    this.submitted = true;

    if (this.questionnaireForm.invalid) {
        return;
    }
    this.questionnaireResponse.item = [];
    for (const data of this.dynamicFormArr) {
      const items  = {linkId : '', definition : '', text : '', answer : []};
      items.linkId = data.linkId;
      items.definition = data.id;
      items.text = data.text;
      if (data.type === 'group') { // create inner objects
        for (const [index, val] of (data.item).entries()) {
          items.answer.push({item: this.generateInnerItem(val, data.id, index)}); // Pass Id & Index to iterate over Form Array
        }
      } else {
        const value = this.questionnaireForm.get(data.id).value;
        items.answer.push(this.setAnswer(data.type, value));
      }
      this.questionnaireResponse.item.push(items);
    }
  }

  generateInnerItem(data: any, id: string, index: number) {
    const innerItems  = {linkId : '', definition : '', text : '', answer : []};
    innerItems.linkId = data.linkId;
    innerItems.definition = data.id;
    innerItems.text = data.text;
    const questionnaireDetails = this.questionnaireForm.get(id) as FormArray;
    const value = questionnaireDetails.controls[index].value;
    innerItems.answer.push(this.setAnswer(data.type, value));
    return innerItems;
  }

  setAnswer(type: string, value: any) {
    switch (type) {
      case 'string': {
        const ans = {valueString : value};
        return ans;
      }
      case 'boolean': {
        const ans = {valueBoolean : value};
        return ans;
      }
      case 'date': {
        const ans = {valueDate : value};
        return ans;
      }
      default: return;
    }
  }

}
