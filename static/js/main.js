'use strict';

var cart = (function($){
    var userData,
        userCart;


    function startData() {
        $.getJSON('/json/', function(data){
            userData = data;
        });
        return userData;
    }

    // Получаем данные
    function updateData() {
        userCart = JSON.parse(localStorage.getItem('cart')) || [];
        return userCart;
    }

    // Сохраняем данные в localStorage
    function saveData() {
        localStorage.setItem('cart', JSON.stringify(userCart));
        return userCart;
    }

    // Поиск объекта в коллекции cartData по id
    function getById(id) {
        return _.findWhere(userCart, {id: id});
    }

    // Добавление товара в коллекцию
    function add(item) {
        var oldItem;
        updateData();
        oldItem = getById(item.id);
        if(!oldItem) {
            userCart.push(item);
        } else {
            oldItem.count = oldItem.count + item.count;
        }
        saveData();
        return item;
    }

    // Поиск продукта в корзине по id
    function findCartElemById(id) {
        return $('.js-cart-item' + '[' + 'data-id' + '="'+id+'"]');
    }

    // Изменение количества товара в коллекции
    function changeCount(id, delta) {
        var item;
        updateData();
        item = getById(id);
        if(item) {
            item.count = item.count + delta;
            if (item.count < 0) {
                item.count = 0;
            }
            saveData();
        }
        return getById(id) || {};
    }

    // Рендерим каталог
    function renderCatalog() {
        alert('');
        var template = _.template($('#table-users-template').html()),
            data = {
                users: userData
            };
        $('#table-users').html(template(data));
    }

    // Рендерим корзину
    function renderCart() {
//        alert('Рендер шаблона');
        var template = _.template($('#cart-template').html()),
            data = {
                carts: userCart
            };
        $('#cart').html(template(data));
    }
    // Добавление в корзину
    function _onClickAddBtn() {
        $('body').on('click', '.js-add-to-cart', function(e) {
            var $this = $(this);
            add({
                id: +$this.attr('data-id'),
                name: $this.attr('data-name'),
                count: 1
            });
            renderCart();
//            alert('Товар добавлен в корзину');
        });
    }

    // Меняем количество товаров в корзине
    function _onClickChangeCountInCart() {
        $('body').on('click', '.js-change-count', function(e) {
            var $this = $(this),
                id = +$this.attr('data-id'),
                delta = +$this.attr('data-delta'),
                $cartElem = findCartElemById(id),
                cartItem = changeCount(id, delta);
            if (cartItem.count) {
                $cartElem.find('.js-count').html(cartItem.count);
            }
            renderCart();
        });
    }

    //Кнопка "Сохранить в"
    function _saveIn() {
        $('body').on('click', '#save-in', function(e){
        alert('Нажали кнопку СОХРАНИТЬ В');
        localStorage.setItem('user', JSON.stringify(userData));

        });
    }


    function _bindHandlers(){
        _onClickAddBtn();
        _onClickChangeCountInCart();
        _saveIn();
    }

     function init(){
        startData();
        updateData();
        renderCatalog();
        renderCart();
        _bindHandlers();
    }

    return {
        init:init
    }
})(jQuery);

jQuery(document).ready(cart.init);