const USERNAME = 'admin';
const PASSWORD = '12345';
const URL = 'https://jsonplaceholder.typicode.com/todos';
var completedTasks = [];
var pendingTasks = [];
var tickCount = 0;

// Toggle password display
function togglePassword(field){
    let pwd = $('#password');
    if(field.getAttribute('toggleStat') == 'hide'){
        field.setAttribute('toggleStat', 'show');
        field.innerHTML = 'Show password <i class="far fa-eye"></i>';
        if(pwd.val() != null){
            pwd.attr('type','text');
        }
    }
    else{
        field.setAttribute('toggleStat', 'hide');
        field.innerHTML = 'Show password <i class="far fa-eye-slash"></i>';
        if(pwd.val() != null){
            pwd.attr('type','password');
        }
    }
}

// Verify username and password
// Hide/show page elements
function validateLogin(){
    let username = $('#username').val();
    let password = $('#password').val();
    if(username === USERNAME && password === PASSWORD){
        $('#loginValidationMessage').text("");
        $('.login').attr('hidden',true);
        $('.navbar').attr('hidden',false);
        $('.tasks').attr('hidden',false);
        fetchList(loadList,errorHandler);
        return true;
    }
    else{
        $('#loginValidationMessage').text("Invalid username or password");
        return false;
    }
}

// Hide/show page elements
function logout(){
    $('#username').val('');
    $('#password').val('');
    $('.task-controls').attr('hidden',true);
    $('.tasks').attr('hidden',true);
    $('.navbar').attr('hidden',true);
    $('.login').attr('hidden',false);
}

//Fetch list of tasks from api
function fetchList(callback,errorHandler){
    let apiResponse;
    let htmlContent = "<p class='boxMessage'>Loading..</p>"
    $('.pending-tasks').html(htmlContent);
    $('.completed-tasks').html(htmlContent);
    // Load existing list of tasks if available in memory
    // Else fetch from api
    if(pendingTasks.length || completedTasks.length){
        displayPendingTasks();
        displayCompletedTasks();
    }
    else{
        apiResponse = $.getJSON(URL);
        apiResponse.done(function(response, status){
            if(status === 'success'){
                callback(response);
            }
            else{
                errorHandler(status);
            }
        });
        apiResponse.fail(function(response,status){
            errorHandler(status);
        });
    }
}

function errorHandler(errText){
    let htmlContent = "<p class='boxMessage'>Sorry! Unable to fetch tasks.</p>";
    $('.task-controls').attr('hidden',true);
    $('.pending-tasks').html(htmlContent);
    $('.completed-tasks').html(htmlContent);
}

function loadList(list){
    for (let i in list){
        list[i].priority = "none";
        list[i].date = "";
        if(list[i].completed){
            completedTasks.push(list[i]);
        }
        else{
            pendingTasks.push(list[i]);
        }
    }
    displayPendingTasks();
    displayCompletedTasks();
}

function refreshLists(){
    let completedIndices = [];
    for (let i in pendingTasks){
        if(pendingTasks[i].completed){
            completedTasks.unshift(pendingTasks[i]);
            // Store indices to remove from pending tasks in a seperate array
            completedIndices.push(i);
        }
    }
    for(let i in completedIndices){
        // Fade out this item.
        $(`.pending-tasks table tr:nth-child(${parseInt(completedIndices[i]) + 1})`).fadeOut(300);
        // Remove the item at previously selected indices from pendingTasks array
        // completedIndices[i]-i is used for adjusting the mismatch in index due to removing elements from pendingTasks array
        pendingTasks.splice(completedIndices[i]-i,1);
    }
    setTimeout(displayPendingTasks,300);
    displayCompletedTasks();
    // Fade in newly added items in completed tasks list.
    $(`.completed-tasks table tr:nth-child(-n+${tickCount})`).fadeOut(1).fadeIn(300);
}

function sortByPriority(){
    pendingTasks.sort(function(a,b){
        let priorities = {
            none: 0,
            low: 1,
            medium: 2,
            high: 3
        };
        return priorities[b.priority] - priorities[a.priority];
    });
    displayPendingTasks();
    $('.pending-tasks').fadeOut(1).fadeIn(300);
}

function sortByDate(){
    pendingTasks.sort(function(a,b){
        let date_a = new Date(a.date);
        let date_b = new Date(b.date);
        if(date_a != 'Invalid Date' && date_b == 'Invalid Date') return -1;         //Sort a first
        else if(date_a == 'Invalid Date' && date_b != 'Invalid Date') return 1;     //Sort b first
        else if(date_a == 'Invalid Date' && date_b == 'Invalid Date') return 0;     //No change
        else if(date_a<date_b) return -1;                                           //Sort a first
        else if(date_a>date_b) return 1;                                            //Sort b first
        else return 0;                                                              //No change
    });
    displayPendingTasks();
    $('.pending-tasks').fadeOut(1).fadeIn(300);
}
function addTask(){
    let task = $('#input_task');
    let date = $('#input_date');
    let priority = $('#input_priority');
    if(task.val() !== ''){
        let taskObj = {
            userId: 0,
            id: 0,
            title: task.val(),
            date: date.val(),
            priority: priority.val()
        };
        pendingTasks.unshift(taskObj);
        displayPendingTasks();
    }
    else{
        task.addClass('is-invalid');
        task.attr('placeholder','Type your task here');
    }
}

function displayPendingTasks(){
    let htmlContent = "";
    // Table
    htmlContent += "<table class='table table-borderless table-hover table-sm'>";
    // New item input row
    htmlContent += "<tr class='table-active'>";
    // Add button
    htmlContent += "<td>";
    htmlContent += "<button type='button' class='btn btn-dark btn-sm btn-block' onclick='addTask();'>";
    htmlContent += "<i class='fa fa-calendar-plus-o'></i>";
    htmlContent += "</button>";
    htmlContent += "</td>";
    // New Task
    htmlContent += "<td>";
    htmlContent += `<input id="input_task" class="form-control form-control-sm" type="text" placeholder="Add new task">`;
    // Date selector
    htmlContent += '<td>';
    htmlContent += `<label for="input_date">Due date:</label> `;
    htmlContent += `<input type="date" id= "input_date" style="height:30px;">`;
    htmlContent += '</td>';
    // Priority selector
    htmlContent += "<td>";
    htmlContent += `<label for='input_priority'>Priority:</label> `;
    htmlContent += `<select name='input_priority' id='input_priority' style="height:30px;"'>`;
    htmlContent += "<option value='none' selected>-</option>";
    htmlContent += "<option value='high'>High</option>";
    htmlContent += "<option value='medium'>Medium</option>";
    htmlContent += "<option value='low'>Low</option>";
    htmlContent += "</select>"
    htmlContent += `</td>`;
    htmlContent += "</tr>"; //Row end
    // Tasks
    if(pendingTasks.length){
        for(let i in pendingTasks){
            // Priority color code
            if(pendingTasks[i].priority === 'high') htmlContent += "<tr class='table-danger'>";
            else if(pendingTasks[i].priority === 'medium') htmlContent += "<tr class='table-warning'>";
            else if(pendingTasks[i].priority === 'low') htmlContent += "<tr class='table-primary'>";
            else htmlContent += "<tr>";
            // Checkbox
            htmlContent += '<td>';
            htmlContent += '<div class="custom-control custom-checkbox">';
            htmlContent += `<input type="checkbox" id=${i} class="custom-control-input" style="height:30px;" onchange="countCheckBox(this);"`;
            if(pendingTasks[i].completed) htmlContent += ' checked ';
            htmlContent += `>`;
            htmlContent += `<label class="custom-control-label" for="${i}"></label>`;
            htmlContent += '</div>';
            htmlContent += '</td>';
            // Task
            htmlContent += `<td class="text-truncate" style="max-width: 230px;">`;
            htmlContent += ` ${pendingTasks[i].title}`;
            htmlContent += `</td>`;
            // Date selector
            htmlContent += '<td>';
            htmlContent += `<label for="dt_${i}">Due date:</label> `;
            htmlContent += `<input type="date" id= "dt_${i}" value="${pendingTasks[i].date}" style="height:30px;" onchange="setDate(this);">`;
            htmlContent += '</td>';
            // Priority selector
            htmlContent += "<td>";
            htmlContent += `<label for='dd_${i}'>Priority:</label> `;
            htmlContent += `<select name='dd_${i}' id='dd_${i}' style="height:30px;" onchange='setPriority(this);'>`;
            htmlContent += "<option value='none'"; 
            if(pendingTasks[i].priority === 'none'){
                htmlContent += " selected";
            }
            htmlContent += ">-</option>";
            htmlContent += "<option value='high'"; 
            if(pendingTasks[i].priority === 'high'){
                htmlContent += " selected";
            }
            htmlContent += ">High</option>";
            htmlContent += "<option value='medium'"; 
            if(pendingTasks[i].priority === 'medium'){
                htmlContent += " selected";
            }
            htmlContent += ">Medium</option>";
            htmlContent += "<option value='low'"; 
            if(pendingTasks[i].priority === 'low'){
                htmlContent += " selected";
            }
            htmlContent += ">Low</option>";
            htmlContent += "</select>"
            htmlContent += `</td>`;
            htmlContent += "</tr>"; //Row end
        }
        htmlContent += "</table>";  //Table end
        $('.task-controls').attr('hidden',false);
    }
    else{
        htmlContent += "</table>";  //Table end
        htmlContent += "<p class='boxMessage'>Hurray!! Everything done.</p>";
        $('.task-controls').attr('hidden',true);
    }
    $('.pending-tasks').html(htmlContent);
}

function displayCompletedTasks(){
    let htmlContent = "";
    if(completedTasks.length){
        htmlContent += "<table class='table table-borderless table-hover table-sm'>";
        for(let i in completedTasks){
            htmlContent += "<tr>";
            htmlContent += `<td class="text-truncate" style="max-width: 15vw"><input type="checkbox" checked disabled=true">`;
            htmlContent += ` <s>${(completedTasks[i].title)}</s></td>`;
            htmlContent += "</tr>";
        }
        htmlContent += "</table>";
    }
    else{
        htmlContent += "<p class='boxMessage'>Nothing to show here.</p>"
    }
    $('.completed-tasks').html(htmlContent);
}

function setPriority(input){
    let index = input.id.substring(3);
    pendingTasks[index].priority = input.value;
    displayPendingTasks();
}

function setDate(input){
    let index = input.id.substring(3);
    pendingTasks[index].date = input.value;
    displayPendingTasks();
}

function countCheckBox(input){
    doneFiveTasks(input)
    .then(showAlert)
    .then(refreshLists)
    .then(function(){
        tickCount = 0;
    });
}

function doneFiveTasks(input){
    return new Promise(function(resolve){
        if(input.checked){
            tickCount++;
            pendingTasks[input.id].completed = true;
        }
        else{
            tickCount--;
            pendingTasks[input.id].completed = false;
            if(tickCount < 0){
                tickCount = 0;
            }
        }
        if(tickCount >= 5){
            resolve();
        }
    });
}

function showAlert(){
    return new Promise(function(resolve){
        setTimeout(function(){
            let userResponse = confirm(`Congrats! You've done ${tickCount} tasks.\nMove those to the completed section?`);
            if(userResponse == true){
                resolve();
            }
        },100);
    });
}