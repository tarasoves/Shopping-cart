'use strict';

var menu = (function($){

    var countData;

    function getData(){
        countData = JSON.parse(localStorage.getItem('count')) || [];
        return countData;
    }

    function saveData(){
        localStorage.setItem('count', JSON.stringify(countData));
        return countData;
    }

    function remove(id){
        getData();
        countData = _.reject(countData, function(item) {
            return item.id === id;
        });
        saveData();
        return countData;
    }

    function add(item) {
        countData.push(item);
        saveData();
        return countData;
    }

    function changeCount(id, delta){
        var item;
        getData();
//        alert(countData);
        item = _.findWhere(countData, {id: id});
//        alert('id = '+id+' item = '+item);
        if (item) {
//            alert('yes');
            item.count = item.count + delta;
            if (item.count < 1){
                remove(id);
            }
        } else if (delta > 0) {
//            alert('no');
            add({id:id, count:1});
        }
        saveData();
    }

    function _onClickChangeCount(){
        $('body').on('click', '.js-change-count', function(e) {
            var $this = $(this),
                id = $this.attr('data-id'),
                delta = +$this.attr('data-delta');
            changeCount(id, delta);
//            alert('Нажал!');
            var elem = document.getElementById(id);
//            alert(elem.textContent);
            if (_.findWhere(countData, {id: id})) {
                elem.textContent = _.findWhere(countData, {id: id}).count;
            } else {
                elem.textContent = 0;
            }
//            alert(elem);
        });
    }

    function _onClickSaveOrder(){
        $('body').on('click', '#save-order', function(e) {
            var ord = localStorage.getItem('count');
            $.ajax({
                url:'/savemenu/',
                type:'POST',
                processData: false,
//                dataType: 'JSON',
                data: ord,
             });
        });
    }


    function init(){
        _onClickChangeCount();
        _onClickSaveOrder();
    }

    return {
        init:init
    }

})(jQuery);

jQuery(document).ready(menu.init);