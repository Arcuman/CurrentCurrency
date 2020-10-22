//https://www.nbrb.by/api/exrates/rates/dynamics/298?startdate=2020-10-20&enddate=2020-10-22
const search = document.querySelector("#search-text");
const table = document.querySelector(".currency-table");
const tbody = document.querySelector(".currency-table > tbody");
const input = document.querySelector(".daterange");


//Получаем дату для апи запроса
function getValidDate(date) {
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function getValidDate(date) {
	return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

//Увеление даты на один день
Date.prototype.addDays = function (days) {
	var date = new Date(this.valueOf());
	date.setDate(date.getDate() + days);
	return date;
}


//Получение массива дат
function getDates(startDate, stopDate) {
	var dateArray = new Array();
	var currentDate = startDate;
	while (currentDate <= stopDate) {
		dateArray.push(new Date(currentDate));
		currentDate = currentDate.addDays(1);
	}
	return dateArray;
}

//добавление в таблицу даты
function addDateToTable(start, end) {
	let Row = document.createElement("TR");
	let dateNULL = document.createElement("TD");
	dateNULL.appendChild(document.createTextNode(''));
	Row.appendChild(dateNULL);
	let dates = getDates(start, end);
	for (let date of dates) {
		let dateTD = document.createElement("TD");
		dateTD.appendChild(document.createTextNode(`${getValidDate(date)}`));
		Row.appendChild(dateTD);
	}
	tbody.appendChild(Row);
}

//добавление в таблицу данных о валюте в таблицу
function addDataInTable(currency, data) {
	let Row = document.createElement("TR");
	let cur = document.createElement("TD");
	cur.appendChild(document.createTextNode(`${currency}`))
	Row.appendChild(cur);
	//мин и макс значения
	let maxValue = data[0].Cur_OfficialRate - 1;
	let minValue = data[0].Cur_OfficialRate + 1;
	let minNode, maxNode;
	for (let item of data) {
		let cur = document.createElement("TD");
		cur.appendChild(document.createTextNode(`${item.Cur_OfficialRate}`))
		Row.appendChild(cur);
		if (item.Cur_OfficialRate < minValue) {
			minValue = item.Cur_OfficialRate;
			minNode = cur;
		}
		if (item.Cur_OfficialRate > maxValue) {
			maxValue = item.Cur_OfficialRate;
			maxNode = cur;
		}
	}
	if (data.length > 1) {
		minNode.classList.add('min-value');
		maxNode.classList.add('max-value');
	}
	tbody.appendChild(Row);
}


async function getCurrency(startDate, endDate) {
	let codes = new Map([
		['EUR', 292],
		['USD', 145],
		['RUR', 298]
	]);
	if (tbody.hasChildNodes()) {
		let children = tbody.childNodes;
		let count = children.length;
		while (count > 0) {
			children[0].remove();
			count--;
		}
	}
	addDateToTable(startDate, endDate);
	endDateStr = getValidDate(endDate);
	startDateStr = getValidDate(startDate);

	for (let [codeName, codeId] of codes) {
		const url = `https://www.nbrb.by/api/exrates/rates/dynamics/${codeId}?startdate=${startDateStr}&enddate=${endDateStr}`;
		const res = await fetch(url);
		const data = await res.json();
		addDataInTable(codeName, data);
	}
}
//Поиск в таблице
function tableSearch() {
	var regPhrase = new RegExp(search.value, 'i');
	var flag = false;
	for (var i = 1; i < table.rows.length; i++) {
		flag = false;
		flag = regPhrase.test(table.rows[i].cells[0].innerHTML);
		if (flag) {
			table.rows[i].style.display = "";
		} else {
			table.rows[i].style.display = "none";
		}
	}

}

function getCurrentCurrency() {
	let endDate = new Date();
	let startDate = new Date();
	startDate.setDate(endDate.getDate() - 6);
	getCurrency(startDate, endDate);
}

function setInput() {
	let endDate = new Date();
	let startDate = new Date();
	let maxDate = new Date();
	let minDate = new Date();
	startDate.setDate(endDate.getDate() - 6);
	minDate.setFullYear(maxDate.getFullYear() - 1);
	$(function () {
		$('input[name="daterange"]').daterangepicker({
			startDate: startDate,
			endDate: endDate,
			maxDate: maxDate,
			minDate: minDate,
			maxSpan: {
				"days": 10
			},
		}, function (start, end, label) {
			getCurrency(new Date(start), new Date(end));
		});
	});
}

document.addEventListener('DOMContentLoaded', setInput);
document.addEventListener('DOMContentLoaded', getCurrentCurrency);
search.addEventListener('keyup', tableSearch);