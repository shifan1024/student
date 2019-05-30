
var pageSize = 10;
var nowPage = 1;
var tableData = [];
var searchWord = "";
function bindEvent() {
    $('#menu').on('click', 'dd', function (e) {
        $('#menu > dd.active').removeClass('active');
        $(this).addClass('active');
        var id = $(this).attr('data-id');
        // console.log($(this).data('id'))
        if (id == 'student-list') {
            getTableData(nowPage);
            $('#add-student-form')[0].reset();
        }
        $('.content').fadeOut();
        $('#' + id).fadeIn();
    }); 
    $('#edit-submit').click(function (e) {
        e.preventDefault();
        var data = $('#edit-student-form').serialize()
        transferData('/api/student/updateStudent', data, function() {
            alert('修改成功');
            $('#modal').slideUp();
            $('#menu > dd[data-id=student-list]').trigger('click');
        });
    });
    $('#add-submit').click(function(e) {
        e.preventDefault();
        var data = $('#add-student-form').serialize();
        transferData('/api/student/addStudent', data, function() {
            alert('提交成功');
            $('#add-student-form')[0].reset();
            $('#menu > dd[data-id=student-list]').trigger('click');
        });
    });
    // 搜索过滤功能
    $('#search-submit').click(function(e) {
        var value = $('#search-word').val();
        nowPage = 1;
        if (!value) {
            getTableData(nowPage);
            return false;
        }
        searchWord = value;
        getSearchTableData();
    })

}
function bindTableEvent() {
    $('.edit').click(function (e) {
        var index = $(this).data('index');
        $('#modal').slideDown();
        initEditForm(tableData[index]);
    });
    $('.modal-content').click(function(e) {
        e.stopPropagation();
    })
    $('#modal').click(function(e) {
        $('#modal').slideUp();
    });

    $('.del').click(function(e) {
        var index = $(this).data('index');
        var isDel = window.confirm('确认删除？');
        var sNo = tableData[index].sNo;
        if (isDel) {
            transferData('/api/student/delBySno', {
                sNo: sNo
            }, function (req) {
                alert('删除成功');
                $('#menu > dd[data-id=student-list]').trigger('click');
            });
        }
    })
}
// 获取表格数据+
function getTableData(page) {
    transferData('/api/student/findByPage',{
        page: page,
        size: pageSize
    }, function(req) {
        allPage = Math.ceil(req.data.cont / pageSize);
        $('#turn-page').turnPage({
            allPage: allPage,
            curPage: page,
            changePage: function (page) {
                nowPage = page;
                getTableData(page);
            }
        });
        renderTable(req.data.findByPage);
    });
}

function getSearchTableData() {
    // 获取搜索后的表格数据
    transferData("/api/student/searchStudent", {
        sex: -1,
        search: searchWord,
        page: nowPage,
        size: pageSize,
    }, function (req) {
        var allPage = Math.ceil(req.data.cont / pageSize);
        $('#turn-page').turnPage({
            curPage: nowPage,
            allPage: allPage,
            changePage: function (page) {
                nowPage = page;
                getSearchTableData();
            }
        });
        renderTable(req.data.searchList);
    });
}
// 初始化编辑的表单
function initEditForm(data) {
    var editForm = $('#edit-student-form')[0];
    for (var prop in data) {
        if (editForm[prop]) {
            editForm[prop].value = data[prop];
        }
    }
}
function init () {
    bindEvent();
    $('#menu > dd').eq(0).trigger('click');
}
init();
function renderTable(data) {
    tableData = data;
    var str = '';
    data.forEach(function (item, index) {
        str += '<tr>\
            <td>' + item.sNo + '</td>\
            <td> ' + item.name + ' </td>\
            <td>' + (item.sex ? '女' : '男') + '</td>\
            <td> ' + item.email + '</td>\
            <td>' + ( new Date().getFullYear() - item.birth) +'</td>\
            <td> ' + item.phone + '</td>\
            <td> ' + item.address + '</td>\
            <td>\
                <button class="btn edit" data-index=' + index + '>编辑</button>\
                <button class="btn del" data-index=' + index + '>删除</button>\
            </td>\
        </tr>';
    });
    $('#student-body').html(str);
    bindTableEvent();
}
function transferData(api, data, callback) {
    if ($.type(data) == 'string') {
        data += "&appkey=shifan1024_1547778100209";
    } else {
        data = $.extend(data, {
            appkey: 'shifan1024_1547778100209'
        });
    }
    $.ajax({
        type: 'get',
        url: 'http://api.duyiedu.com' + api,
        data: data,
        dataType: 'json',
        success: function (req) {
            if (req.status == 'success') {
                callback(req);
            } else {
                alert(req.msg);
            }
        }
    });
}