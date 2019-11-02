
//BUDGET CONTROLLER-- data validation from user input fields..
var budgetController = (function(){
    //function constructor..
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    //building private funtion for the calculateBudget function
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum +=curr.value;
        });
        //storing the final total values into the data.totals
        data.totals[type] = sum;
    };
    
    //data structure to store data from the input..
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    // this return statement will return above private method. 
    return {
        addItem: function(type, des, val){
            var newItem, ID;
            //create new id 
            // only increments the value of the id if the element exits in the array.
            if (data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length-1].id +1 ;
            }else{
                ID = 0;
            }
            
            //recreate new item based on 'inc' and 'des'
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else{
                newItem = new Expense(ID, des, val)
            }
            //push new item into the array..
            data.allItems[type].push(newItem);
            //finaly return new element 
            return newItem;
        },
        
        deleteItem: function(type, id){
            var ids, index;
            
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            //finding index of the array
            index = ids.indexOf(id);
            //deleting id from array
            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function(){
            //calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            //Calculate the percentage of income that we spent..
            //only calculating if the total inc is > 0 or else set to false or dont display
            if( data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
        },
        
        //retrieving all data to the UI
        getBudget: function(){
          
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        
        testing: function(){
            console.log(data);
        }
    };
})();


//UICONTROLLER-- create all UI elements 
var UIController = (function(){
    //declaring all dom strings and classes
    
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValues: '.add__value',
        inputBtn : '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    }
    /*The return statement makes below function public */
    return {
        getInput: function (){
            //returing all three values.. 
            return{
                type : document.querySelector(DOMStrings.inputType).value,  
                description: document.querySelector(DOMStrings.inputDescription).value,
                //converting string to float for the calcualtion. 
                value: parseFloat(document.querySelector(DOMStrings.inputValues).value)
            };
        },
        
        addlistItem: function(obj, type){
            
            var html, newHtml, elememt;
            //Create HTML string with place hoder text
            if (type === 'inc') {
                element = DOMStrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
                
            } else if (type === 'exp') {
                element = DOMStrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%',obj.value);
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        clearFields : function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValues);
            
            //querySelectorAll will return list array, coverting it to the normal array so we can use array methods.
            //using Array.prototype methods on it will help us to loop over it. 
            //passing 'fields' as this variable.
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(curr, index, arr){
               //loops over current selected fields and sets it to empty..
                console.log('I am Here....')
                curr.value = "";
            });
            //setting focus back to the first field once its cleared..
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var dolarSign = "$";
              document.querySelector(DOMStrings.budgetLabel).textContent = dolarSign + obj.budget;
              document.querySelector(DOMStrings.incomeLabel).textContent = dolarSign + obj.totalInc;
              document.querySelector(DOMStrings.expensesLabel).textContent = dolarSign + obj.totalExp;
            
            if(obj.percentage > 0){
                document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMStrings.percentageLabel).textContent = '--';
            }
        },
        
        getDOMStrings : function(){
            return DOMStrings;
        }
    }
})();


//GLOBAL CONTROLLER
//below controller wil set the connection between above two controller..

var controller = (function(budgetCtrl, UICtrl){
    var DOM = UICtrl.getDOMStrings();
    
    //Setting up eventlisteners for all events at one place.
    var setupEventListeners = function(){
        //for the button press
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrAddItem, updateBudget);

        //for key board press...
        document.addEventListener('keypress', function(event){

            if(event.keyCode === 13 || event.which === 13){
                ctrAddItem();
            }
        });
        
        //for dynamic delete buttons on 'container' element
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    };
    
    //Updating Budget in the UI..
    var updateBudget = function(){
        console.log('Updating your UI..')
        //1. Calculate the Budget..
        budgetCtrl.calculateBudget();
        
        //2. Return the Budget..
        var budget = budgetCtrl.getBudget();
        
        //3. Display the Budget on the UI..
        UICtrl.displayBudget(budget);
        //console.log(budget);
        
    };
    
    //Adding items from input fiels to the UI
    var ctrAddItem = function(){
        var input, newItem;
        
        //1. Get the filed input data
        var input = UICtrl.getInput();
        
        //Validating user input field if description and the value fields are either empty or the value field is NaN.
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            //3. add the item to teh UI
            UIController.addlistItem(newItem, input.type);

            //4. Clear fields..
            UIController.clearFields();

            //5. Calculate and Update Budget..
            updateBudget();

            console.log(input);
        }
       
    };
    
    //for element deletion
    var ctrlDeleteItem = function(Event){
      var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; 
        
        //if ID exist then perform deletion
        if(itemID){
            //using split method ie 'inc-1' to 'inc', '1'
            splitID  = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            //1. delete the item from the data structure..
            budgetCtrl.deleteItem(type, ID);
            //2. Delete the item form the UI..
            
            //3. Update and show the new budget..
            
        }
        console.log(splitID)
        //console.log(event.target.parentNode.parentNode.parentNode.parentNode)
    };
    
    
    return {
        init: function() {
            console.log('Application has started...');
            //this will initialize the app and reset all defaults to Zero.
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    }
  //below two parameters will allow this controller to access all methods and variables that is declared.   
})(budgetController, UIController);

controller.init();