'use strict';

//$(document).ready(function(e){
//    $.getJSON('/json/', function(data){});
//})

var cart = (function($){

    function init(){
        _render();
    }

    function _render(){
        var t_template = _.template($('#table-users-template').html()),
            $t_users = $('#table-users');

        $.getJSON('/json/', function(data){
            $t_users.html(t_template({users:data}));
        });
    }

    return {
        init:init
    }

})(jQuery);

jQuery(document).ready(cart.init);



// Получаем данные
function updateData() {
    userData = JSON.parse(localStorage.getItem('user')) || [];
    return userData;
}

// Возвращаем данные
function getData() {
    return userData;
}

// Сохраняем данные в localStorage
function saveData() {
    localStorage.setItem('user', JSON.stringify(userData));
    return userData;
}

// Очищаем данные
function clearData() {
    userData = [];
    saveData();
    return userData;
}

// Поиск объекта в коллекции cartData по id
function getById(id) {
    return _.findWhere(userData, {id: id});
}

// Добавление товара в коллекцию
function add(item) {
    var oldItem;
    updateData();
    oldItem = getById(item.id);
    if(!oldItem) {
        userData.push(item);
    } else {
        oldItem.count = oldItem.count + item.count;
    }
    saveData();
    return item;
}

// Удаление товара из коллекции
function remove(id) {
    updateData();
    userData = _.reject(userData, function(item) {
        return item.id === id;
    });
    saveData();
    return userData;
}

// Изменение количества товара в коллекции
function changeCount(id, delta) {
    var item;
    updateData();
    item = getById(id);
    if(item) {
        item.count = item.count + delta;
        if (item.count < 1) {
            remove(id);
        }
        saveData();
    }
    return getById(id) || {};
}

// Возвращаем количество товаров (количество видов товаров в корзине)
function getCount() {
    return _.size(userData);
}

// Возвращаем общее количество товаров
function getCountAll() {
    return _.reduce(userData, function(sum, item) {return sum + item.count}, 0);
}

// Добавление в корзину
function _onClickAddBtn() {
    $('body').on('click', '.js-add-to-cart', function(e) {
        var $this = $(this);
        add({
            id: +$this.attr(opts.attrId),
            name: $this.attr(opts.attrName),
            count: 1
        });
        renderMenuCart();
        alert('Товар добавлен в корзину');
    });
}