"use strict"

/*
Copyright (c) 2026 Ronni Kahalani

X: https://x.com/RonniKahalani
Github: https://github.com/RonniKahalani
Website: https://learningisliving.dk
LinkedIn: https://www.linkedin.com/in/kahalani/

Permission is hereby granted, free of charge, to any person obtaining a copy  
of this software and associated documentation files (the "Software"), to deal  
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell  
copies of the Software, and to permit persons to whom the Software is  
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all  
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR  
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,  
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE  
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER  
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,  
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE  
SOFTWARE.
*/

/**
 * This script handles the tasks.
 */
const TASK_STATE_FAILED = 'failed';
const TASK_STATE_SUCCESS = 'success';
const TASK_STATE_ACTIVE = 'active';

const TASK_TRIGGER_DELAY_MILLIS = 180;

let tasks = [];

/**
 * Sets a task as started.
 * @param {*} task 
 * @returns {object}
 */
function taskStarted(task) {
    task.startTime = Date.now();
    task.state = "active";
    tasks.push(task);
    return task;
}

/**
 * Sets a task as failed
 * @param {*} task 
 */
function taskFail(task) {
    task.state = TASK_STATE_FAILED;
    task.endTime = Date.now();
    return task;
}

/**
 * Sets a task as successed.
 * @param {*} task 
 */
function taskSuccess(task) {
    task.state = TASK_STATE_SUCCESS;
    task.endTime = Date.now();
    return task;
}

/**
 * Initializes task monitoring
 */
function initTaskInterval() {
    const interval = setInterval(() => {
        const activeTasks = tasks.filter((task) => task.state === TASK_STATE_ACTIVE);
        const successTasks = tasks.filter((task) => task.state === TASK_STATE_SUCCESS);
        const failTasks = tasks.filter((task) => task.state === TASK_STATE_FAILED);

        setVisibility(responseSpinnerElem, activeTasks.length > 0);
        taskActivityElem.innerHTML = `${activeTasks.length} active, ${successTasks.length} success, ${failTasks.length} fail.`;
    }, TASK_TRIGGER_DELAY_MILLIS);

    return interval;
}