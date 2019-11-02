
//BUDGET CONTROLLER
var budgetController = (function(){
   //Createing function constructor object that holds the Expense and Income from the UI..
    // Function constructor always starts from the Capitol letter. 
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    
    //chaining Expense prototype to get percentages..
    Expense.prototype.calcPercentages = function(totalIncome){
        
        if( totalIncome > 0){
             this.percentage = Math.round((this.value / totalIncome) * 100);
        }else {
            this.percentage = -1 ;
        }
    }
    
    Expense.prototype.getPercentage = function(){
        //this function will return percentage from above..
        return this.percentage;
    }
    
    var Income = function(id,description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;//returns the first value of the array.
        });
        data.totals[type] = sum;
    }
    
    //storing all data into one data structure..
    var data = {
        allItems : {
            exp : [],
            inc : [] 
        },
        totals : {
            exp : 0,
            inc: 0
        },
        budget : 0,
        percentage : -1
    }
    //lets make all these available to the public
    
    return {
        addItem : function(type, des, val){
            var newItem, ID ;
            //create new ID only if array length is not 0 
            if( data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else {
                ID = 0;
            }
            //Create new item based on its type either 'inc' or 'exp' and assigned id from above.
            if(type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if(type === 'inc'){
                newItem = new Income(ID, des, val);
            }
            
            //depending up the type, we now push data into the array of addItem, either Income or Expense.
            data.allItems[type].push(newItem);
            
            //return new element..
            return newItem
        },
        deleteItem : function(type, id){
            var ids, index;
            //this will return the selected id of the element..
            //since map will return new array..
            var ids = data.allItems[type].map(function(current){
                return current.id;
            });
            //get the index of the deleting item id..
            index = ids.indexOf(id);
            if(index !== -1){
                //if the item exist then delete it
                data.allItems[type].splice(index, 1)
            }
        },
        calculateBudget: function(){
            
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calcualate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;
            
            // calculate the percentage of income that we spent
            //when there is no income and there is expenses, percentage usually thorw error with value of 'Infinity'
            //to overcome this we will pass it with conditional statement..
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            } 
        },
        
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentages(data.totals.inc);
            })
        },
        
        getPercentages : function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        
        getBudget : function(){
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },
        //this is only for testing purpose..
        testing : function(){
            console.log(data);
        }
    }
})();

// UI CONTROLLER
var UIController = (function(){
    //this will controll all the UI part of the app..
    //creating an object of all classes...
    var DOMStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description',
        inputValue: '.add__value',
        addButton : '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel : '.budget__value',
        incomeLabel : '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expensePercLabel : '.item__percentage',
        dateLabel : '.budget__title--month'
        
    }
    var nodeListForEach = function(list, callback){
        for(let i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };
           //now we format the number to the display 
    var formateNumber = function(num, type){
            var numSplit, int, dec;
            //+ or -  to the number.
            
            num = Math.abs(num);
            num = num.toFixed(2);
            // excactly 2 decimal points..
            numSplit = num.split('.');
            int = numSplit[0];
            
            if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }
            dec = numSplit[1];
            // comma separated thousands..
            
            return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
        };
    // retriving user input valuses...
    
    return {
        //inorder to retrive all three values we need to assign all of these to the object and retrive them
        getInput : function(){
            return{
                incExpType :document.querySelector(DOMStrings.inputType).value,
                description : document.querySelector(DOMStrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMStrings.inputValue).value)
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
            newHtml = newHtml.replace('%value%',formateNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem : function(selectorId){
            
            //to remove the child we need to select the parent element.
            var el = document.getElementById(selectorId);
            //then we remove the child from the selected parent element..
            el.parentNode.removeChild(el);
        },
        
        clearFeilds : function(){
            var fields;
            fields = document.querySelectorAll(DOMStrings.inputDescription + ',' + DOMStrings.inputValue);
            
            var fieldsArray = Array.prototype.slice.call(fields);
            
            fieldsArray.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArray[0].focus();
        },
        displayBudget : function(obj){
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
        
        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMStrings.expensePercLabel);
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0){
                    
                    current.textContent = percentages[index] + '%';
                }else{
                    
                    current.textContent = '--';
                    
                }
                
            });
            
        },
        
        displayMonth: function(){
            var now, month, months, year;
            now = new Date();
            
            months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            month = now.getMonth();
            year = now.getFullYear();
            
            document.querySelector(DOMStrings.dateLabel).textContent = months[month] +' ' + year;
            
        },
        
        changedType : function(){
            var fields = document.querySelectorAll(
                DOMStrings.inputType + ',' +
                DOMStrings.inputDescription + ','+
                DOMStrings.inputValue
            )
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMStrings.addButton).classList.toggle('red');
        },
        //from here we will make DOMStrings Object public and usable to all controller..
        getDOMStrings : function(){
            return DOMStrings;
        }
    };
})();

//GLOBAL APP CONTROLER
var appController = (function(budgetCtrl, UICtrl){
   
    //saving public UIController method 
    var DOM = UICtrl.getDOMStrings();
    //setting up a initializer function..
    var setupEventListeners = function() {
        document.querySelector(DOM.addButton).addEventListener('click', ctrlAddItem, updateBudget);
        // Adding the keypress event on users 'enter' press..
        document.addEventListener('keypress', function(event){
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        
        //deleting items from the dom
        document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);
        
        //when user changes the type ..
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    //updat budget fields. 
    var updateBudget = function(){
        console.log('Updating your UI..')
        //1. Calculate the budget 
        budgetCtrl.calculateBudget();
        
        //2. Return budget
        var budget = budgetCtrl.getBudget();
        
       //3. Display the budget on the UI..
        UICtrl.displayBudget(budget);
    }
    
    var updatePercentages = function(){
        
        //1. Calculate percentages..
        budgetCtrl.calculatePercentages();
        
        //2. Read percentages from the budget conroller
        var percentages = budgetCtrl.getPercentages();
        
        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
        console.log();
    }

    var ctrlAddItem = function() {
         var input, newItem;
        
        //1. Get the field input data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            
            //2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.incExpType, input.description, input.value);
            
            //4. Clear fields..
            UICtrl.clearFeilds();
            
            //3. Add the item to the UI 
            UICtrl.addlistItem(newItem, input.incExpType);
            
            //5. Calculate and update budget..
            updateBudget();
            
            //6. Calculate and update percentages
            updatePercentages();
       
        }
    }
    
    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, ID;
        
        //retrieve item id from the DOM
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id
        if(itemId){
            //split its name and identifier..
            splitId = itemId.split("-");
            type = splitId[0];
            ID = parseInt(splitId[1]);
        }
        //1. delete the item form the data structure..
        budgetCtrl.deleteItem(type, ID);
        
        //2. Delete the item form the UI..
        UICtrl.deleteListItem(itemId);
        //3. Update and show the new Budget..
        updateBudget();
        //console.log('Type: ',type, 'ID : ', ID);
    }
    
    //initializing the setupEventlistener making it available publicly...
    return {
        init : function(){
            console.log('Application has started.....')
            UIController.displayMonth();
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

})(budgetController, UIController);

appController.init();