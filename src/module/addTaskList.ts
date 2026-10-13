import type { IData, ILocalStorage } from "./addTaskList.type";

let main_form: HTMLElement | null = document.getElementById("main_form");
let taskInput: HTMLElement | null = document.getElementById("taskInput");
let error_msg = document.getElementById("error_msg");
let taskListParent: HTMLElement | null = document.getElementById("taskListParent");
let totalTaskCount = document.getElementById("totalTaskCount");
let completedTasksTag = document.getElementById("copletedTasks");
let penndingTasksTag = document.getElementById("penndingTasks");
let currentFilter: "all" | "pending" | "completed" = "all";
let all_task_side_bar = document.getElementById("all_task_side_bar");
let taskListSection = document.getElementById("taskListSection");
let allTasksCount = document.getElementById("allTasksCount");
let CompletedTaskCount = document.getElementById("CompletedTaskCount");
let add_submit_btn: HTMLElement | null = document.getElementById("add_submit_btn");
let editItemId: string | null | undefined = null;
let taskCategory: HTMLElement | null = document.getElementById("taskCategory");

main_form?.addEventListener("submit", (event) => {
    event.preventDefault();

    let formData = new FormData((main_form as HTMLFormElement));

    let entries = Object.fromEntries(formData);
    let task = entries.task;
    let category = entries.category;

    if (entries.task == "" || entries.category == "") {

        error_msg?.classList.remove("hidden")

        main_form?.addEventListener("input", () => {
            error_msg?.classList.add("hidden")
        })

        return;

    }

    let checkLocalStorage = localStorage.getItem('taskList')

    if (!checkLocalStorage) {

        let newtask: ILocalStorage = {

            data: [
                {
                    id: crypto.randomUUID(),
                    task: String(task),
                    category: String(category),
                    isDone: false
                }
            ]

        };

        localStorage.setItem('taskList', JSON.stringify(newtask))

    } else {

        let oldDataWithOutStingfy = localStorage.getItem("taskList")

        let oldData = JSON.parse(oldDataWithOutStingfy as string).data;

        if (editItemId) {

            let updateTaskListAfterEdit = (oldData).map((item: IData) => {
                if (item.id == editItemId) {
                    return {
                        ...item,
                        task: task,
                        category: category
                    }
                } else {
                    return item;
                }
            })

            let dataForLocalStorage = {
                data: updateTaskListAfterEdit
            }

            localStorage.setItem('taskList', JSON.stringify(dataForLocalStorage));
            if (add_submit_btn) add_submit_btn.innerText = "Add";
            if (editItemId) editItemId = null;
            (main_form as HTMLFormElement).reset();
            renderHTMLCode();
            return;


        }

        let updateDataWithOldData: ILocalStorage = {
            data: [
                ...oldData,
                {
                    id: crypto.randomUUID(),
                    task: String(task),
                    category: String(category),
                    isDone: false
                }
            ]
        }

        localStorage.setItem('taskList', JSON.stringify(updateDataWithOldData))
    }

    (main_form as HTMLFormElement).reset();
    renderHTMLCode();

})

// Delete, Done, Edit Buttons
taskListParent?.addEventListener("click", (event) => {

    let target = (event.target as HTMLElement);
    let deleteBtn = target.closest<HTMLElement>('.deleteTask');
    let doneBtn = target.closest<HTMLElement>('.doneBtn');
    let editBtn = target.closest<HTMLElement>('.editTask');
    let idFromDeleteBtn = deleteBtn?.dataset.id;
    let idFromEditBtn = editBtn?.dataset.id;
    let idFromDoneBtn = doneBtn?.dataset.id;

    let allTasks = localStorage.getItem("taskList");
    let taskList = allTasks ? JSON.parse(allTasks as string).data : [];



    if (deleteBtn) {

        let updateCodeAfterDelete = taskList.filter((item: IData) => item.id != idFromDeleteBtn);

        let isConfirm = confirm("Are you sure you want to remove this");
        if (isConfirm == false) return;

        let updateCodeDelete = {
            data: updateCodeAfterDelete
        }

        localStorage.setItem("taskList", JSON.stringify(updateCodeDelete));
        renderHTMLCode();
    };


    if (doneBtn) {

        let updateTaskList = taskList.map((item: IData) => {

            if (item.id == idFromDoneBtn) {
                return {
                    ...item,
                    isDone: !item.isDone
                }
            } else {
                return item;
            }

        })


        let updateCodeAfterDone = {
            data: updateTaskList
        }


        localStorage.setItem('taskList', JSON.stringify(updateCodeAfterDone));
        renderHTMLCode();

    }

    if (editBtn) {

        editItemId = idFromEditBtn;

        let editItem = taskList.find((item: IData) => {
            return item.id == (editItemId);
        })

        if (!editItem) return;

        (taskInput as HTMLInputElement).value = editItem.task;
        if (taskCategory) (taskCategory as HTMLSelectElement).value = editItem.category;
        if (add_submit_btn) add_submit_btn.innerHTML = "Update";

    }


})

// filter Buttons 
let filterButtons = document.querySelectorAll<HTMLButtonElement>('.taskFilter');
filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter as "all" | "pending" | "completed";

        filterButtons.forEach((btn) => {
            btn.classList.remove("bg-green-600", "text-white");
            btn.classList.add("bg-white", "text-slate-600");
        });

        button.classList.remove("bg-white", "text-slate-600");
        button.classList.add("bg-green-600", "text-white");

        renderHTMLCode();


    })
})





// ============== Helper Function ==================

// render HTML code 
function renderHTMLCode() {

    let taskListHtmlCode = "";

    let allTasks = localStorage.getItem("taskList");

    let taskList = allTasks ? JSON.parse(allTasks as string).data : [];


    let filteredTasks = taskList.filter((item: IData) => {
        if (currentFilter === "pending") {
            return !item.isDone;
        }
        if (currentFilter === "completed") {
            return item.isDone;
        }
        return true;
    })



    filteredTasks.map((item: IData) => {

        return taskListHtmlCode += `
              <article "
                class="task-card flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:gap-4 sm:p-5">
                <div data-id="${item.id}" class="doneBtn h-5 flex justify-center items-center w-5 shrink-0 rounded-full border-2 border-slate-300">
                    <span class="${item.isDone == true ? "" : "hidden"} text-green-600 pl-[1px] text-[18px]">
                        <i class="fa-solid fa-circle-check"></i>
                    </span>
                </div>

                <div class="min-w-0 flex-1">
                  <div class="flex flex-wrap items-center gap-2">
                    
                    <h4 class="font-bold text-slate-800 ${item.isDone == true ? "line-through opacity-60" : ""}">${item.task}</h4>
                    <span
                      class="rounded-full  px-2.5 py-1 text-xs font-semibold ${item.category == "Work" ? "text-green-600 bg-green-50" : ""} ${item.category == "Personal" ? "text-red-600 bg-red-50" : ""} ${item.category == "Other" ? "text-purple-600 bg-purple-50" : ""} ${item.category == "Study" ? "bg-blue-50 text-blue-600" : ""}  ${item.isDone == true ? "line-through opacity-60" : ""}">${item.category}</span>
                  </div>
                  <p class="mt-2 text-xs text-slate-400 sm:text-sm">
                   <!-- <i class="fa-regular fa-calendar mr-1.5"></i>
                    Tomorrow, 7:00 PM -->
                  </p>
                </div>

                <button type="button" class="p-2 text-slate-400 transition hover:text-amber-500">
                <i class="fa-regular fa-star"></i>
              <!--  <i class="fa-solid fa-star"></i> -->
                </button>

             
                <!-- Edit Button -->
                <button data-id="${item.id}"
                type="button"
                class="editTask cursor-pointer p-2 text-slate-400 transition hover:text-blue-500"
                title="Edit Task"
                >
                <i class="fa-solid fa-pen-to-square"></i>
                </button>

                <!-- Delete Button -->
                <button data-id="${item.id}" class="p-2 cursor-pointer deleteTask text-slate-400 transition hover:text-red-500"
                title="Delete Task"
                >
                <i class="fa-solid fa-trash"></i>
                </button>




              </article>
        `

    })




    let completedTasks = taskList.filter((item: IData) => item.isDone);
    let pendingTasks = taskList.filter((item: IData) => !item.isDone);

    if (completedTasksTag) {
        completedTasksTag.innerHTML = String(completedTasks.length);
    }

    if (penndingTasksTag) {
        penndingTasksTag.innerHTML = String(pendingTasks.length);
    }

    if (taskListParent) {
        taskListParent.innerHTML = taskListHtmlCode;
    }

    if (totalTaskCount) {
        totalTaskCount.innerHTML = taskList.length;
    }

    if (CompletedTaskCount) {
        CompletedTaskCount.innerHTML = String(completedTasks.length);
    }

    if (allTasksCount) {
        allTasksCount.innerHTML = taskList.length;
    }

}
renderHTMLCode();

// scroll into tasks 
all_task_side_bar?.addEventListener('click', () => {

    taskListSection?.scrollIntoView({
        behavior: "smooth",
        block: ("start")
    })

})

