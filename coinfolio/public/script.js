var total_invested = 0;
var total_final = 0;
var options = { day: '2-digit', month: '2-digit', year: 'numeric' };

$(document).ready(function() {

    var page_url = $(location).attr("href");
    var user_name = "CoinFolio";

    if (page_url.search("user=") !== -1) {
        user_name = page_url.substr(page_url.indexOf("=") + 1);
    }

    $("#userName").text("Hello, " + user_name);


    $.getJSON("/api/crypto_list")
        //then este numai dupa ce l-a facut si raspunde cu succes
        // . (punctul) face chaining
        .then(function(res) {
            getCryptoListings(res);
        });

    // la click pe row se apeleaza functia
    $('#coin_table').on('click', '.row', function() {
        // alert("apasat");
    })
    // la click pe butonul Add New Coin apeleaza functia
    $('#addNewCoinBtn').on('click', function(event) {
        showForm($(this), true);
    });

    // la click pe butonul de Delete din tabel apelam functia cu parametrul elementul parinte al butonului (row-ul)
    $('#coin_table').on('click', '.delete_btn', function(event) {
        // opreste propagarea evenimentului de click pe butonul delete pentru a nu executa evenimentul de click si pe rand unde apeleaza alta functie la click
        event.stopPropagation();
        deleteEntry($(this).parent().parent());
    });
    // apeleaza functia showForm (cu atribute 
    //      #false=nu sunt date noi# si 
    //      #coinData=obiectul salvat in memoria jQuery cu toate datele# ) 
    // la click pe butonul cu clasa edit.btn din elementul cu id-ul #coin_table
    $('#coin_table').on('click', '.edit_btn', function(event) {
        // opreste propagarea evenimentului de click pe butonul delete pentru a nu executa evenimentul de click si pe rand unde apeleaza alta functie la click
        event.stopPropagation();

        var coinData = $(this).parent().parent().data('coinData');

        showForm($(this), false, coinData);
    });

});

// preia lista de pe coinmarketcap.com
function getCryptoListings(data) {
    $.getJSON('https://api.coinmarketcap.com/v1/ticker/?limit=1000')
        .then(function(res) {
            getCurrentPrice(res, data);
        })
        .catch(function(err) {
            console.log(err);
            renderList(data);
        })
}

// preia si adauga in lista pretul actual al monedei
function getCurrentPrice(listingData, coinList) {
    var arr = [];
    // coinList din baza de date
    // listingData din coinmarketcap
    coinList.forEach(function(coin) {
        listingData.forEach(function(item) {
            if (item.symbol === coin.coin.name) {
                var obj = {};
                for (key in coin) {
                    obj[key] = coin[key];
                }
                obj.coin["current_price"] = item.price_usd;
                obj.coin["total_value"] = item.price_usd * obj.coin["quantity"];

                // ?
                arr.push(obj);
            }
        })
    })
    renderList(arr);
}

// afiseaza lista
function renderList(list) {
    list.forEach(function(item) {
        renderRow(item);
        total_invested += item.coin.quantity * item.coin.bought_price;
        total_final += item.coin.total_value;
    });

    // rotunjim la 2 zecimale
    total_invested = roundNumber(total_invested, 2);
    total_final = roundNumber(total_final, 2);
    // afisam in html
    $('#total_invested + .widget_item_content').text(total_invested);
    $('#total_value + .widget_item_content').text(total_final);
    var profit = total_final - total_invested;
    $('#profit + .widget_item_content').text(profit);

}

// afiseaza un rand
function renderRow(item) {
    var newRow = $('<div class="row"></div>');
    // in memoria jQuery atribuie (in cheia 'id') randului id-ul inregistrarii 
    newRow.data('id', item._id);
    // salvat datele care vin din backend (tot obiectul coin) in memoria jQuery pentru a fi mai usor de transmis mai departe
    newRow.data('coinData', item.coin);
    $('#coin_table').append(newRow);
    generateRowCells(item, newRow);
}

function generateRowCells(item, newRow) {

    var current_price = newRow.data('coinData').current_price || item.coin.current_price;
    var total_value = item.coin.quantity * current_price;

    // Parse string to date format pentru formatarea datei
    var new_bougth_date = new Date(item.coin.bought_date);
    // formatarea datei cu functia .toLocaleDateString conform optiunilor declarate mai sus in variabila 'options'
    // se putea face si cu datepicker, https://stackoverflow.com/questions/5250244/jquery-date-formatting
    var formated_bought_date = new_bougth_date.toLocaleDateString('ro-RO', options);

    var newItem = $('<div class="row_wrapper"><div class="cell name">' + item.coin.name + '</div><div class="cell quantity">' + item.coin.quantity + '</div><div class="cell bought_date">' + formated_bought_date + '</div><div class="cell bought_price">' + item.coin.bought_price + '</div><div class="cell current_price">' + roundNumber(current_price, 2) + '</div><div class="cell total_value">' + roundNumber(total_value, 2) + '</div><div class="cell wallet_address">' + item.coin.wallet_address + '</div><button class="btn edit_btn"><i class="fas fa-edit"></i></button><button class="btn delete_btn"><i class="far fa-trash-alt"></i></button></div>');
    $(newRow).append(newItem);

}

// trimite datele introduse catre server
function addDataToServer() {
    var coinName = $('#coin_name').val() || undefined;
    var coinQuantity = $('#coin_quantity').val() || undefined;
    var boughtDate = $('#bought_date').val() || undefined;
    var boughtPrice = $('#bought_price').val() || undefined;
    var walletAddress = $('#wallet_address').val() || undefined;
    //send request to create entry
    if (!(coinName === undefined || coinQuantity === undefined)) {
        $.post('api/crypto_list', {
                coin: {
                    name: coinName,
                    quantity: coinQuantity,
                    bought_date: boughtDate,
                    bought_price: boughtPrice,
                    wallet_address: walletAddress
                }
            })
            // manipulare erori @168.5'
            .then(function(newEntry) {
                renderRow(newEntry);
            })
            .catch(function(err) {
                console.log(err);
            })
    } else {
        return;
    }

}

function showForm(element, isNewData, data) {
    var form = $('<div class="form"><input type="text" id="coin_name" class="form_field" name="name" placeholder="Name"><input type="number" id="coin_quantity" class="form_field" name="quantity" placeholder="Quantity"><input type="date" id="bought_date" class="form_field" name="bought_date" placeholder="Bought Date"><input type="number" id="bought_price" class="form_field" name="bought_price" placeholder="Bough Price"><div class="form_field static">current-price</div><div class="form_field static">total</div><input type="text" id="wallet_address" class="form_field" name="wallet_address" placeholder="Wallet Address"><button id="addEntry" class="btn" name="submit"><i class="fas fa-save"></i><span>Add Coin</span></button><button id="cancel_btn" class="btn" name="submit"><i class="fas fa-ban"></i><span>Cancel</span></button></div>');

    // simuleaza click pe butonul Cancel pentru a inchide formularul / Fix pentru a se reafisa butonul din formularul curent care se inchide
    $('#cancel_btn').click();
    // sterge toate formularele cu clasa .form deschide in pagina
    $('body').find('.form').remove();

    element.parent().parent().append(form);
    toggleElements(element);


    // cand data introdusa nu este noua (este introdusa prin form-ul din Edit) input-urile preiau valorile salvate in memorie
    if (!isNewData) {
        $('#coin_name').val(data.name);
        $('#coin_quantity').val(data.quantity);
        $('#bought_date').val(data.bought_date);
        $('#bought_price').val(data.bought_price);
        $('#wallet_address').val(data.wallet_address);
        // schimba contentul butonului de Add cand este in modul editare row
        $('#addEntry').html('<i class="fas fa-save"></i>');
    }

    $('#addEntry').click(function(event) {
        if (isNewData) {
            addDataToServer();
        } else {
            updateEntry(element.parent().parent());
        }
        toggleElements(element);
        form.remove();
    });

    // la apasarea pe butonul Cancel se ascunde butonul (clasa hide_btn) si se sterge formularul
    $('#cancel_btn').click(function(event) {
        element.parent().toggleClass('hide_btn');
        form.remove();
    })
}

function toggleElements(element) {
    element.parent().toggleClass('hide_btn');
}

function updateEntry(row) {
    var updateUrl = '/api/crypto_list/' + row.data('id');

    // in variabila updateData preluam informatiile introduse in campurile noi
    var updateData = {
        coin: {
            name: $('#coin_name').val() || undefined,
            quantity: $('#coin_quantity').val() || undefined,
            bought_date: $('#bought_date').val() || undefined,
            bought_price: $('#bought_price').val() || undefined,
            wallet_address: $('#wallet_address').val() || undefined
        }
    };
    // incarca datele din updateData la url-ul definit updateUrl
    $.ajax({
            method: 'PUT',
            url: updateUrl,
            data: updateData
        })
        .then(function(newData) {
            row.empty();
            generateRowCells(newData, row);
        })
}

function deleteEntry(row) {
    // preia in variabila clickedId valoarea cheii 'id' din memoria jQuery
    var clickedId = row.data('id');
    // construieste url-ul cu tot cu id
    var deleteUrl = '/api/crypto_list/' + clickedId;

    // request catre BD sa stearga inregistrarea cu id-ul respectiv @169.10'
    $.ajax({
            method: 'DELETE',
            url: deleteUrl
        })
        // executa cand primeste succes de la server
        .then(function(data) {
            row.remove();
        })
        // executa cand primeste eroare de la server
        .catch(function(err) {
            console.log(err);
        })

}

// rotunjirea / reducerea unui numar la x (scale) zecimale
// https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
function roundNumber(num, scale) {
    if (!("" + num).includes("e")) {
        return +(Math.round(num + "e+" + scale) + "e-" + scale);
    } else {
        var arr = ("" + num).split("e");
        var sig = ""
        if (+arr[1] + scale > 0) {
            sig = "+";
        }
        return +(Math.round(+arr[0] + "e" + sig + (+arr[1] + scale)) + "e-" + scale);
    }
}