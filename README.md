<p float="left" style="margin-left:-80px">
  <img src="https://raw.githubusercontent.com/rexshijaku/ChoiceFilter/master/readme/choicfilterjs-logo.png" width="44%">
  <a href="https://www.youtube.com/watch?v=C1fbcX93428" target="_blank">
  <img src="https://raw.githubusercontent.com/rexshijaku/ChoiceFilter/master/readme/choicefilterjs.gif" width="38%" height="420"/> 
  </a>
</p>


# ChoiceFilter

ChoiceFilter is a pure Vanilla JavaScript library which creates chained dependency among select dropdown lists, checkboxes and radio buttons in a simple and an easy way. A common use case is if you select a continent from a dropdown then countries in another dropdown which relies on continents should be filtered based on the selected item, similarly countries dropdown may filter a group of checkboxes for instance a group of cities. In this case of ChoiceFilter, continents filter countries and countries filter cities, if continents dropdown is changed based on its new value the domino effect may occur and the whole chain gets affected.

#### Main Features

  - Pure Vanilla Javascript
  - No Dependencies
  - Simple & Easy to use
  - Single file 
  - Creates chained dependency among n elements
  - Creates chained dependency among different element types e.g dropdown, checkbox, radio 
  - Creates and handles Domino effect
 
Supports following relationships:
  - Dropdown to Dropdown
  - Dropdown to Checkbox
  - Dropdown to Radio
  - Checkbox to Checkbox
  - Checkbox to Dropdown
  - Checkbox to Radio
  - Radio to Radio
  - Radio to Checkbox
  - Radio to Dropdown
 
You can build dependency (relationships) like:
  - Dropdown to Checkbox to Radio to Dropdown
  - Radio to Checkbox to Dropdwon

### Demo
Check a combined-example demo  <a href="https://www.youtube.com/watch?v=C1fbcX93428" target="_blank">here</a>.

## Get Started
##### Install by manual download: 
Donwload choice-filter.js which is located in js folder and include it as follows :
```html
 <script type="text/javascript" src="choicefilter.js"> </script>
```
##### Node
You can also install it from npm by running the following command:
```html
npm install @rexshijaku/choicefilter
```
include it as:
```sh
require('@rexshijaku/choicefilter');
```

### Usage

There are ten different examples (tutorials) on how to use this library on the *demo* folder above.
Here will be explained only one. In this example is presented a relationship between *two dropdowns*:
##### Javascript code:
##
```javascript
        //select elements
  		var continents = document.getElementById("continents"); // this will be parent elem
  		var countries = document.getElementById("countries"); // this will be child (dependent)

       //create a connection between them 
  		continents.filtchoices(countries, 
                  {
                    data:{
                          "europe":["de","xk","tr"],
                          "asia":["jp","tr"]
                          },
                      independentChoices : "select-a-country",
                      autoSelectedChoicesAfterFilter: "select-a-country",
                      showAllChildChoicesWhen: "all" 
      	          }); 
```
##### Html code: 
##
```html
     <select class="form-control" id="continents">
        <option value="">Select a continent</option>
         <option value="all">Europe and Asia</option>
        <option value="europe">Europe</option>
        <option value="asia">Asia</option>
      </select>
      <br>
      <select class="form-control" id="countries">
        <option value="select-a-country">Select a country</option>
        <option value="de">Germany</option>
        <option value="xk">Kosovo</option>
       	<option value="jp">Japan</option>
        <option value="tr">Turkey</option>
      </select>
```

### Arguments
Some important arguments are briefly explained below:
| Argument         | DataType    | Default  | Description |
| ------------- |:----------:| -----:| -----:|
| data  | key value pair array | empty array |  Mapped data of parent and child. Which values of parent element controls which values of child. |
| autoFilterOnInit  |  true or false | true | Whether or not change event should be triggered when the relationship is created. |
| independentChoices |   single or an array of values  | empty array  | Choices of dependent element which are not affected by filter. |
| showAllChildChoicesWhen |   single or an array of values  | empty array  | Choices in parent element which show all choices in the dependent element |
| autoSelectedChoicesAfterFilter |  single or an array of values  | empty array  |  Choices in child element which should be auto-selected when filtering occurs. A common example is when you want to select a default value of a dropdown to suggest a selection, if choices were updated and previous selection does not exists anymore. |
| presentOnEveryParent | single or an array of values  | empty array  | Choices in child element which are present in every parent. This differs from independentChoices because these will be toglle only when parent has a value.|
| parentControlsVisibilityOf |   CSS selector | empty string | When parent has a value these elements will be shown, when not they will not be shown.      |
| ignoreParentValues |   single or an array of values | empty array | Ignore values which should not have an effect in filter, cases like 'Please select an item!'      |
| wrapperSelector |  CSS selector | empty string | Wrapper of a child choices. If child choices have wrappers, selector must be provided in this argument |
| valueDelimiter |  string | "," | If your values are strings which can contain any character. You should think what value should be given as a delimiter. This values should not be present in any value of element which is used as either parent or child. |

To understand these arguments  more easily, please check the demo folder provided in the repository.

### Support
For general questions about choicefilter.js, tweet at @rexshijaku or write me an email on rexhepshijaku@gmail.com.
To have a quick tutorial check the demo folder provided in the repository.


### Author
##### Rexhep Shijaku
 - Email : rexhepshijaku@gmail.com
 - Twitter : https://twitter.com/rexshijaku
 
### License
MIT License

Copyright (c) 2020 | Rexhep Shijaku

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
