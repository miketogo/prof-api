##### Basic functionality
# Requests documentation
------
# METHOD GET
------
## GET requests without auth

#### Get all added houses
 ```javascript
fetch('_BASE_URL/all-houses', {
      method: 'GET',
    }).then(this._checkResponse)
```
Returns all created houses
```sh
{
"houses": [
            { 
                "entranceArray": [], // Массив парадных
                "_id": "612d042e4e023f05ec588cba", // ID дома
                "name": "Ново-Александровская 14", // Название дома
                "formValue": "novoal14test", // Значение передаваемое в формы
                "city": "Санкт-Петербург", // Город
                "address": "улица Ново-Александровская, дом 14", // Адресс дома
                "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                    "_id": "612d042e4e023f05ec588cbb", // ID справки
                    "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                    "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },{nextStatement}...],
            },
{nextHouse},...]}
```

#### Verify user email
 ```sh
https://_BASE_URL/emailCheck/:token
```
Redirect to
```sh
_BASE_URL
```

## GET requests with auth
------
#### Get current user info
 ```javascript
fetch('_BASE_URL/me', {
      method: 'GET',
       headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    }).then(this._checkResponse)
```
Returns all information about current user
```sh
{
"user": [
            {
            "emailVerified": true, // Подтвержден ли email
            "telegram_id": "123", // Telegram chat ID привязанный к пользователю
            "_id": "6126c3828f2c235cf071cd13", // ID Пользователя
            "fullname": "Суриков Михаил Михайлович", // ФИО Пользователя
            "lastname": "Суриков", // Фамилия Пользователя
            "firstname": "Михаил", // Имя Пользователя
            "patronymic": "Михайлович", // Отчество Пользователя
            "house": {  // Дом который выбрал пользователь
                "entranceArray": [], // Массив парадных
                "_id": "612d042e4e023f05ec588cba", // ID дома
                "name": "Ново-Александровская 14", // Название дома
                "formValue": "novoal14test", // Значение передаваемое в формы
                "city": "Санкт-Петербург", // Город
                "address": "улица Ново-Александровская, дом 14", // Адресс дома
                "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                    "_id": "612d042e4e023f05ec588cbb", // ID справки
                    "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                    "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },
                    {nextStatement}...],
            "__v": 0
            },
            "email": "miketogo66@gmail.com", // Email пользователя
            "flat": 534, // Номер квартиры
            "entranceNumber": 7, // Номер пардной(рассчитывается автоматически)
            "phone": "79112962441", // Номер телефона
            "registrationDate": "Thu Aug 26 2021 01:26:10 GMT+0300 (Москва, стандартное время)",// Дата регистрации
            "__v": 0,
            "meterReadings": [{ // Массив показаний счётчиков
                "_id": "612157482ac8b73774c93f6e",  // ID показаний
                "time": "21.08.2021  22:43",  // Дата дачи показаний
                "hotWaterSupply": 12, // Показания счетчика ГВС
                "coldWaterSupply": 13 // Показания счетчика ХВС
                },
                {nextMeterReadings}...]
}]}
```

#### Get current user info by telegram chat id
 ```javascript
fetch('_BASE_URL/telegram/user/:chat_id', {
      method: 'GET',
    }).then(this._checkResponse)
```
Returns all information about current user
```sh
{
"user": [
            {
            "emailVerified": true, // Подтвержден ли email
            "telegram_id": "123", // Telegram chat ID привязанный к пользователю
            "_id": "6126c3828f2c235cf071cd13", // ID Пользователя
            "fullname": "Суриков Михаил Михайлович", // ФИО Пользователя
            "lastname": "Суриков", // Фамилия Пользователя
            "firstname": "Михаил", // Имя Пользователя
            "patronymic": "Михайлович", // Отчество Пользователя
            "house": {  // Дом который выбрал пользователь
                "entranceArray": [], // Массив парадных
                "_id": "612d042e4e023f05ec588cba", // ID дома
                "name": "Ново-Александровская 14", // Название дома
                "formValue": "novoal14test", // Значение передаваемое в формы
                "city": "Санкт-Петербург", // Город
                "address": "улица Ново-Александровская, дом 14", // Адресс дома
                "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                    "_id": "612d042e4e023f05ec588cbb", // ID справки
                    "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                    "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },
                    {nextStatement}...],
            "__v": 0
            },
            "email": "miketogo66@gmail.com", // Email пользователя
            "flat": 534, // Номер квартиры
            "entranceNumber": 7, // Номер пардной(рассчитывается автоматически)
            "phone": "79112962441", // Номер телефона
            "registrationDate": "Thu Aug 26 2021 01:26:10 GMT+0300 (Москва, стандартное время)",// Дата регистрации
            "__v": 0,
            "meterReadings": [{ // Массив показаний счётчиков
                "_id": "612157482ac8b73774c93f6e",  // ID показаний
                "time": "21.08.2021  22:43",  // Дата дачи показаний
                "hotWaterSupply": 12, // Показания счетчика ГВС
                "coldWaterSupply": 13 // Показания счетчика ХВС
                },
                {nextMeterReadings}...]
}]}
```

#### Get current user available statements for manufacturing
 ```javascript
fetch('_BASE_URL/houses/statements', {
      method: 'GET',
       headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    }).then(this._checkResponse)
```
Returns all statements available to the current user
```sh
{
"statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                    "_id": "612d042e4e023f05ec588cbb", // ID справки
                    "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                    "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                }],
{nextStatement}...],
```

#### Get current user's appeals
 ```javascript
fetch('_BASE_URL/appeals/my', {
      method: 'GET',
       headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    }).then(this._checkResponse)
```
Returns all users appeals
```sh
{
"appeals": [
        {
            "image": "not image",  // Ссылка на картинку при наличии картинки
            "status": "waiting",  // Статус обращения
            "_id": "612d206dd2b1bc4944dd0100",  // ID обращения
            "text": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Текст обращения
            "owner": "6126c3828f2c235cf071cd13", // ID создателя обращения
            "dateOfRequest": "30.08.2021  21:16", // Дата создания обращения
            "howReceived": "Через сайт", // Через какой ресурс полученно обращение
            "type": "statement", // Тип обращения
            "adminsChangedStatus": [], // Логи администраторов измененивших статус обращения
            "__v": 0
        },
{nextAppeal}...]
}
```

#### Get current user's appeals from telegram with chat id
 ```javascript
fetch('_BASE_URL/appeals-from-tg/:chat_id/my', {
      method: 'GET',
    }).then(this._checkResponse)
```
Returns all users appeals
```sh
{
"appeals": [
        {
            "image": "not image",  // Ссылка на картинку при наличии картинки
            "status": "waiting",  // Статус обращения
            "_id": "612d206dd2b1bc4944dd0100",  // ID обращения
            "text": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Текст обращения
            "owner": "6126c3828f2c235cf071cd13", // ID создателя обращения
            "dateOfRequest": "30.08.2021  21:16", // Дата создания обращения
            "howReceived": "Через сайт", // Через какой ресурс полученно обращение
            "type": "statement", // Тип обращения
            "adminsChangedStatus": [], // Логи администраторов измененивших статус обращения
            "__v": 0
        },
{nextAppeal}...]
}
```

## GET requests with admin auth
------
#### Get list of sent emails
 ```javascript
fetch('_BASE_URL/sent-emails', {
      method: 'GET',
       headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    }).then(this._checkResponse)
```
Returns all sent emails
```sh
{
"emails": [
        {
            "_id": "612940f693dddf55ec6c8fc7", // ID email сообщения
            "title": "Ваше обращение принято в обработку", // Заголовок письма
            "text": "Отслеживать статус обращения можно в разделе Мои обращения", // Текст письма
            "to_user": { // Кому отправленно
                "emailVerified": true, // Подтвержден ли email
                "telegram_id": "123", // Telegram chat ID привязанный к пользователю
                "_id": "6126c3828f2c235cf071cd13", // ID Пользователя
                "fullname": "Суриков Михаил Михайлович", // ФИО Пользователя
                "lastname": "Суриков", // Фамилия Пользователя
                "firstname": "Михаил", // Имя Пользователя
                "patronymic": "Михайлович", // Отчество Пользователя
                "house": {  // Дом который выбрал пользователь
                    "entranceArray": [], // Массив парадных
                    "_id": "612d042e4e023f05ec588cba", // ID дома
                    "name": "Ново-Александровская 14", // Название дома
                    "formValue": "novoal14test", // Значение передаваемое в формы
                    "city": "Санкт-Петербург", // Город
                    "address": "улица Ново-Александровская, дом 14", // Адресс дома
                    "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                        "_id": "612d042e4e023f05ec588cbb", // ID справки
                        "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                        "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },
                    {nextStatement}...],
                    "__v": 0
                     },
                "email": "miketogo66@gmail.com", // Email пользователя
                "flat": 534, // Номер квартиры
                "entranceNumber": 7, // Номер пардной(рассчитывается автоматически)
                "phone": "79112962441", // Номер телефона
                "registrationDate": "Thu Aug 26 2021 01:26:10 GMT+0300 (Москва, стандартное время)",// Дата регистрации
                "__v": 0,
                "meterReadings": [{ // Массив показаний счётчиков
                    "_id": "612157482ac8b73774c93f6e",  // ID показаний
                    "time": "21.08.2021  22:43",  // Дата дачи показаний
                    "hotWaterSupply": 12, // Показания счетчика ГВС
                    "coldWaterSupply": 13 // Показания счетчика ХВС
                    },
                    {nextMeterReadings}...]
                }
            "date": "Fri Aug 27 2021 22:45:58 GMT+0300 (Москва, стандартное время)", // Дата отправки
            "__v": 0
},{sentEmail2}...]}
```

#### Get user is admin?
 ```javascript
fetch('_BASE_URL/users/is-administrator', {
      method: 'GET',
       headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    }).then(this._checkResponse)
```
Returns true if user is admin
```sh
{
"admin": true
}
```

#### Get list of users
 ```javascript
fetch('_BASE_URL/users/', {
      method: 'GET',
       headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    }).then(this._checkResponse)
```
Returns all users
```sh
{
   "users": [{ 
                "emailVerified": true, // Подтвержден ли email
                "telegram_id": "123", // Telegram chat ID привязанный к пользователю
                "_id": "6126c3828f2c235cf071cd13", // ID Пользователя
                "fullname": "Суриков Михаил Михайлович", // ФИО Пользователя
                "lastname": "Суриков", // Фамилия Пользователя
                "firstname": "Михаил", // Имя Пользователя
                "patronymic": "Михайлович", // Отчество Пользователя
                "house": {  // Дом который выбрал пользователь
                    "entranceArray": [], // Массив парадных
                    "_id": "612d042e4e023f05ec588cba", // ID дома
                    "name": "Ново-Александровская 14", // Название дома
                    "formValue": "novoal14test", // Значение передаваемое в формы
                    "city": "Санкт-Петербург", // Город
                    "address": "улица Ново-Александровская, дом 14", // Адресс дома
                    "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                        "_id": "612d042e4e023f05ec588cbb", // ID справки
                        "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                        "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },
                    {nextStatement}...],
                    "__v": 0
                     },
                "email": "miketogo66@gmail.com", // Email пользователя
                "flat": 534, // Номер квартиры
                "entranceNumber": 7, // Номер пардной(рассчитывается автоматически)
                "phone": "79112962441", // Номер телефона
                "registrationDate": "Thu Aug 26 2021 01:26:10 GMT+0300 (Москва, стандартное время)",// Дата регистрации
                "__v": 0,
                "meterReadings": [{ // Массив показаний счётчиков
                    "_id": "612157482ac8b73774c93f6e",  // ID показаний
                    "time": "21.08.2021  22:43",  // Дата дачи показаний
                    "hotWaterSupply": 12, // Показания счетчика ГВС
                    "coldWaterSupply": 13 // Показания счетчика ХВС
                    },
                    {nextMeterReadings}...]
                },{user2}...]
}
```

#### Get all survey results
 ```javascript
fetch('_BASE_URL/survey', {
      method: 'GET',
       headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    }).then(this._checkResponse)
```
Returns all survey results
```sh
{
"results": [
        {
            "_id": "611c41d67f1fbf492452d6d7", // ID результата опроса
            "firstname": "Иван", // Имя прошедшего опрос
            "secondname": "Иванов", // Фамилия прошедшего опрос
            "email": "test@mail.ru", // Email прошедшего опрос
            "phone": "79119119191", // Телефон прошедшего опрос
            "address": "Санкт-Петербург, ул Пушкина, д. 13",  // Адресс его дома
            "area": 1,  // Площадь квартиры
            "homeOrg": "Тсж жилые массивы",  // Название домоуправленческой организации
            "__v": 0
        }, {result2}...]
}
```

#### Get all users appeals
 ```javascript
fetch('_BASE_URL/appeals/all', {
      method: 'GET',
       headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    }).then(this._checkResponse)
```
Returns all users appeals
```sh
{
"appeals": [
        {
            "image": "not image",  // Ссылка на картинку при наличии картинки
            "status": "waiting",  // Статус обращения
            "_id": "612d206dd2b1bc4944dd0100",  // ID обращения
            "text": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Текст обращения
            "owner": "6126c3828f2c235cf071cd13", // ID создателя обращения
            "dateOfRequest": "30.08.2021  21:16", // Дата создания обращения
            "howReceived": "Через сайт", // Через какой ресурс полученно обращение
            "type": "statement", // Тип обращения
            "adminsChangedStatus": [], // Логи администраторов измененивших статус обращения
            "__v": 0
        }, {appeal2}...]
}
```

# METHOD POST
------
## POST requests without auth

#### Signin
 ```javascript
fetch('_BASE_URL/signin', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "password": password, // Минимально 8 символов
        "email": email // Валидный email
      },
    }).then(this._checkResponse)
```
Returns auth jwt token
```sh
{
"token": "JWT_TOKEN"
}
```

#### Signup
 ```javascript
fetch('_BASE_URL/signup', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "email": email, // Валидный email
        "password": password, // Минимально 8 символов
        "fullname": fullname, // ФИО
        "house": house, // Значение value дома
        "flat": flat, // Номер квартиры, число
        "phone": phone // Номер телефона, минимально 11 символов
      },
    }).then(this._checkResponse)
```
Returns auth jwt token
```sh
{
"token": "JWT_TOKEN"
}
```

#### Telegram connect
 ```javascript
fetch('_BASE_URL/telegram/connect/:chat_id', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "email": email, // Валидный email
        "password": password, // Минимально 8 символов
      },
    }).then(this._checkResponse)
```
Returns updated user
```sh
{
"user": { 
                "emailVerified": true, // Подтвержден ли email
                "telegram_id": "123", // Telegram chat ID привязанный к пользователю
                "_id": "6126c3828f2c235cf071cd13", // ID Пользователя
                "fullname": "Суриков Михаил Михайлович", // ФИО Пользователя
                "lastname": "Суриков", // Фамилия Пользователя
                "firstname": "Михаил", // Имя Пользователя
                "patronymic": "Михайлович", // Отчество Пользователя
                "house": {  // Дом который выбрал пользователь
                    "entranceArray": [], // Массив парадных
                    "_id": "612d042e4e023f05ec588cba", // ID дома
                    "name": "Ново-Александровская 14", // Название дома
                    "formValue": "novoal14test", // Значение передаваемое в формы
                    "city": "Санкт-Петербург", // Город
                    "address": "улица Ново-Александровская, дом 14", // Адресс дома
                    "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                        "_id": "612d042e4e023f05ec588cbb", // ID справки
                        "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                        "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },
                    {nextStatement}...],
                    "__v": 0
                     },
                "email": "miketogo66@gmail.com", // Email пользователя
                "flat": 534, // Номер квартиры
                "entranceNumber": 7, // Номер пардной(рассчитывается автоматически)
                "phone": "79112962441", // Номер телефона
                "registrationDate": "Thu Aug 26 2021 01:26:10 GMT+0300 (Москва, стандартное время)",// Дата регистрации
                "__v": 0,
                "meterReadings": [{ // Массив показаний счётчиков
                    "_id": "612157482ac8b73774c93f6e",  // ID показаний
                    "time": "21.08.2021  22:43",  // Дата дачи показаний
                    "hotWaterSupply": 12, // Показания счетчика ГВС
                    "coldWaterSupply": 13 // Показания счетчика ХВС
                    },
                    {nextMeterReadings}...]
                }
}
```


#### Post survey result
 ```javascript
fetch('_BASE_URL/survey', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "email": email, // Валидный email
        "firstname": firstname, // Имя
        "secondname": secondname, // Фамилия
        "address": address, // Адресс дома
        "homeOrg": homeOrg, // Название домоуправленческой организации
        "phone": phone, // Номер телефона, минимально 11 символов
        "area": area, // Площадь квартиры, число
      },
    }).then(this._checkResponse)
```
Returns result object
```sh
{
    "result":
        {
            "_id": "611c41d67f1fbf492452d6d7", // ID результата опроса
            "firstname": "Иван", // Имя прошедшего опрос
            "secondname": "Иванов", // Фамилия прошедшего опрос
            "email": "test@mail.ru", // Email прошедшего опрос
            "phone": "79119119191", // Телефон прошедшего опрос
            "address": "Санкт-Петербург, ул Пушкина, д. 13",  // Адресс его дома
            "area": 1,  // Площадь квартиры
            "homeOrg": "Тсж жилые массивы",  // Название домоуправленческой организации
            "__v": 0
        }
}
```

## POST requests with auth
------
#### Post new meter readings
 ```javascript
fetch('_BASE_URL/users/meter-update', {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        "hotWater": hotWater, // Показания ГВС, число
        "coldWater": coldWater, // Показания ХВС, число
      },
    }).then(this._checkResponse)
```
Returns updated user
```sh
{
"user": { 
                "emailVerified": true, // Подтвержден ли email
                "telegram_id": "123", // Telegram chat ID привязанный к пользователю
                "_id": "6126c3828f2c235cf071cd13", // ID Пользователя
                "fullname": "Суриков Михаил Михайлович", // ФИО Пользователя
                "lastname": "Суриков", // Фамилия Пользователя
                "firstname": "Михаил", // Имя Пользователя
                "patronymic": "Михайлович", // Отчество Пользователя
                "house": {  // Дом который выбрал пользователь
                    "entranceArray": [], // Массив парадных
                    "_id": "612d042e4e023f05ec588cba", // ID дома
                    "name": "Ново-Александровская 14", // Название дома
                    "formValue": "novoal14test", // Значение передаваемое в формы
                    "city": "Санкт-Петербург", // Город
                    "address": "улица Ново-Александровская, дом 14", // Адресс дома
                    "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                        "_id": "612d042e4e023f05ec588cbb", // ID справки
                        "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                        "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },
                    {nextStatement}...],
                    "__v": 0
                     },
                "email": "miketogo66@gmail.com", // Email пользователя
                "flat": 534, // Номер квартиры
                "entranceNumber": 7, // Номер пардной(рассчитывается автоматически)
                "phone": "79112962441", // Номер телефона
                "registrationDate": "Thu Aug 26 2021 01:26:10 GMT+0300 (Москва, стандартное время)",// Дата регистрации
                "__v": 0,
                "meterReadings": [{ // Массив показаний счётчиков
                    "_id": "612157482ac8b73774c93f6e",  // ID показаний
                    "time": "21.08.2021  22:43",  // Дата дачи показаний
                    "hotWaterSupply": 12, // Показания счетчика ГВС
                    "coldWaterSupply": 13 // Показания счетчика ХВС
                    },
                    {nextMeterReadings}...]
                }
}
```

#### Post send mail again
```javascript
fetch('_BASE_URL/emailCheck/send-again', {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
    }).then(this._checkResponse)
```
Returns updated user
```sh
{
"user": { 
                "emailVerified": true, // Подтвержден ли email
                "telegram_id": "123", // Telegram chat ID привязанный к пользователю
                "_id": "6126c3828f2c235cf071cd13", // ID Пользователя
                "fullname": "Суриков Михаил Михайлович", // ФИО Пользователя
                "lastname": "Суриков", // Фамилия Пользователя
                "firstname": "Михаил", // Имя Пользователя
                "patronymic": "Михайлович", // Отчество Пользователя
                "house": {  // Дом который выбрал пользователь
                    "entranceArray": [], // Массив парадных
                    "_id": "612d042e4e023f05ec588cba", // ID дома
                    "name": "Ново-Александровская 14", // Название дома
                    "formValue": "novoal14test", // Значение передаваемое в формы
                    "city": "Санкт-Петербург", // Город
                    "address": "улица Ново-Александровская, дом 14", // Адресс дома
                    "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                        "_id": "612d042e4e023f05ec588cbb", // ID справки
                        "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                        "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },
                    {nextStatement}...],
                    "__v": 0
                     },
                "email": "miketogo66@gmail.com", // Email пользователя
                "flat": 534, // Номер квартиры
                "entranceNumber": 7, // Номер пардной(рассчитывается автоматически)
                "phone": "79112962441", // Номер телефона
                "registrationDate": "Thu Aug 26 2021 01:26:10 GMT+0300 (Москва, стандартное время)",// Дата регистрации
                "__v": 0,
                "meterReadings": [{ // Массив показаний счётчиков
                    "_id": "612157482ac8b73774c93f6e",  // ID показаний
                    "time": "21.08.2021  22:43",  // Дата дачи показаний
                    "hotWaterSupply": 12, // Показания счетчика ГВС
                    "coldWaterSupply": 13 // Показания счетчика ХВС
                    },
                    {nextMeterReadings}...]
                }
}
```

#### Post new meter readings from telegram
 ```javascript
fetch('_BASE_URL/telegram/user/meter-update/:chat_id', {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        "hotWater": hotWater, // Показания ГВС, число
        "coldWater": coldWater, // Показания ХВС, число
      },
    }).then(this._checkResponse)
```
Returns updated user
```sh
{
"user": { 
                "emailVerified": true, // Подтвержден ли email
                "telegram_id": "123", // Telegram chat ID привязанный к пользователю
                "_id": "6126c3828f2c235cf071cd13", // ID Пользователя
                "fullname": "Суриков Михаил Михайлович", // ФИО Пользователя
                "lastname": "Суриков", // Фамилия Пользователя
                "firstname": "Михаил", // Имя Пользователя
                "patronymic": "Михайлович", // Отчество Пользователя
                "house": {  // Дом который выбрал пользователь
                    "entranceArray": [], // Массив парадных
                    "_id": "612d042e4e023f05ec588cba", // ID дома
                    "name": "Ново-Александровская 14", // Название дома
                    "formValue": "novoal14test", // Значение передаваемое в формы
                    "city": "Санкт-Петербург", // Город
                    "address": "улица Ново-Александровская, дом 14", // Адресс дома
                    "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                        "_id": "612d042e4e023f05ec588cbb", // ID справки
                        "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                        "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },
                    {nextStatement}...],
                    "__v": 0
                     },
                "email": "miketogo66@gmail.com", // Email пользователя
                "flat": 534, // Номер квартиры
                "entranceNumber": 7, // Номер пардной(рассчитывается автоматически)
                "phone": "79112962441", // Номер телефона
                "registrationDate": "Thu Aug 26 2021 01:26:10 GMT+0300 (Москва, стандартное время)",// Дата регистрации
                "__v": 0,
                "meterReadings": [{ // Массив показаний счётчиков
                    "_id": "612157482ac8b73774c93f6e",  // ID показаний
                    "time": "21.08.2021  22:43",  // Дата дачи показаний
                    "hotWaterSupply": 12, // Показания счетчика ГВС
                    "coldWaterSupply": 13 // Показания счетчика ХВС
                    },
                    {nextMeterReadings}...]
                }
}
```

#### Telegram disconnect
 ```javascript
fetch('_BASE_URL/telegram/disconnect/:chat_id', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
    }).then(this._checkResponse)
```
Returns true
```sh
{
    "disconnected": true
}
```

#### Create appeal `type - complaint`
 ```javascript
fetch('_BASE_URL/appeals/create-complaint', {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
       body: JSON.stringify{
        "image": image, // Картинка при наличии
        "text": text, // Текст жалобы
      },
    }).then(this._checkResponse)
```
Returns new appeal
```sh
{
    "appeal": 
        {
            "image": "not image",  // Ссылка на картинку при наличии картинки
            "status": "waiting",  // Статус обращения
            "_id": "612d206dd2b1bc4944dd0100",  // ID обращения
            "text": "Сломалась лампочка", // Текст обращения
            "owner": "6126c3828f2c235cf071cd13", // ID создателя обращения
            "dateOfRequest": "30.08.2021  21:16", // Дата создания обращения
            "howReceived": "Через сайт", // Через какой ресурс полученно обращение
            "type": "complaint", // Тип обращения (жалоба)
            "adminsChangedStatus": [], // Логи администраторов измененивших статус обращения
            "__v": 0
        }
}
```

#### Create appeal from telegram `type - complaint`
 ```javascript
fetch('_BASE_URL/appeals-from-tg/:chat_id/create-complaint', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
       body: JSON.stringify{
        "image": image, // Картинка при наличии
        "text": text, // Текст жалобы
      },
    }).then(this._checkResponse)
```
Returns new appeal
```sh
{
    "appeal": 
        {
            "image": "not image",  // Ссылка на картинку при наличии картинки
            "status": "waiting",  // Статус обращения
            "_id": "612d206dd2b1bc4944dd0100",  // ID обращения
            "text": "Сломалась лампочка", // Текст обращения
            "owner": "6126c3828f2c235cf071cd13", // ID создателя обращения
            "dateOfRequest": "30.08.2021  21:16", // Дата создания обращения
            "howReceived": "Через телеграм бота", // Через какой ресурс полученно обращение
            "type": "complaint", // Тип обращения (жалоба)
            "adminsChangedStatus": [], // Логи администраторов измененивших статус обращения
            "__v": 0
        }
}
```

#### Create appeal `type - statement`
 ```javascript
fetch('_BASE_URL/appeals/order-statement', {
      method: 'POST',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
       body: JSON.stringify{
        "value": value, // Значение value справки
      },
    }).then(this._checkResponse)
```
Returns new appeal
```sh
{
    "appeal": 
        {
            "image": "not image",  // Ссылка на картинку при наличии картинки
            "status": "waiting",  // Статус обращения
            "_id": "612d206dd2b1bc4944dd0100",  // ID обращения
            "text": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Текст обращения
            "owner": "6126c3828f2c235cf071cd13", // ID создателя обращения
            "dateOfRequest": "30.08.2021  21:16", // Дата создания обращения
            "howReceived": "Через сайт", // Через какой ресурс полученно обращение
            "type": "statement", // Тип обращения (Справка)
            "adminsChangedStatus": [], // Логи администраторов измененивших статус обращения
            "__v": 0
        }
}
```

#### Create appeal from telegram `type - statement`
 ```javascript
fetch('_BASE_URL/appeals-from-tg/:chat_id/order-statement', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
       body: JSON.stringify{
        "value": value, // Значение value справки
      },
    }).then(this._checkResponse)
```
Returns new appeal
```sh
{
    "appeal": 
        {
            "image": "not image",  // Ссылка на картинку при наличии картинки
            "status": "waiting",  // Статус обращения
            "_id": "612d206dd2b1bc4944dd0100",  // ID обращения
            "text": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Текст обращения
            "owner": "6126c3828f2c235cf071cd13", // ID создателя обращения
            "dateOfRequest": "30.08.2021  21:16", // Дата создания обращения
            "howReceived": "Через телеграм бота", // Через какой ресурс полученно обращение
            "type": "statement", // Тип обращения (Справка)
            "adminsChangedStatus": [], // Логи администраторов измененивших статус обращения
            "__v": 0
        }
}
```

# METHOD PATCH
------
## PATCH requests with auth

#### Change user profile info
 ```javascript
fetch('_BASE_URL/users/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify{
        fullname: fullname, // Изменённое ФИО
        flat: flat,  // Изменённая квартира
        phone: phone, // Изменённый  номер телефона
        email:  email, // Изменённый email
      },
    }).then(this._checkResponse)
```
Returns updated user object
```sh
{
"user": { 
                "emailVerified": true, // Подтвержден ли email
                "telegram_id": "123", // Telegram chat ID привязанный к пользователю
                "_id": "6126c3828f2c235cf071cd13", // ID Пользователя
                "fullname": "Суриков Михаил Михайлович", // ФИО Пользователя
                "lastname": "Суриков", // Фамилия Пользователя
                "firstname": "Михаил", // Имя Пользователя
                "patronymic": "Михайлович", // Отчество Пользователя
                "house": {  // Дом который выбрал пользователь
                    "entranceArray": [], // Массив парадных
                    "_id": "612d042e4e023f05ec588cba", // ID дома
                    "name": "Ново-Александровская 14", // Название дома
                    "formValue": "novoal14test", // Значение передаваемое в формы
                    "city": "Санкт-Петербург", // Город
                    "address": "улица Ново-Александровская, дом 14", // Адресс дома
                    "statements": [{  // Массив объектов из справок доступных для изготовления в этом доме
                        "_id": "612d042e4e023f05ec588cbb", // ID справки
                        "name": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Название справки
                        "value": "residents_living_and_registered" // Значение передаваемое при заказе справки
                    },
                    {nextStatement}...],
                    "__v": 0
                     },
                "email": "miketogo66@gmail.com", // Email пользователя
                "flat": 534, // Номер квартиры
                "entranceNumber": 7, // Номер пардной(рассчитывается автоматически)
                "phone": "79112962441", // Номер телефона
                "registrationDate": "Thu Aug 26 2021 01:26:10 GMT+0300 (Москва, стандартное время)",// Дата регистрации
                "__v": 0,
                "meterReadings": [{ // Массив показаний счётчиков
                    "_id": "612157482ac8b73774c93f6e",  // ID показаний
                    "time": "21.08.2021  22:43",  // Дата дачи показаний
                    "hotWaterSupply": 12, // Показания счетчика ГВС
                    "coldWaterSupply": 13 // Показания счетчика ХВС
                    },
                    {nextMeterReadings}...]
                }
}
```

## PATCH requests with admin auth
------
#### Change appeal status
 ```javascript
fetch('_BASE_URL/appeals/change-status', {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        "Content-Type": "application/json",
        'Accept': 'application/json',
        'Authorization': `Bearer ${jwt}`,
      },
      body: JSON.stringify{
        status: status, // Новый статус обращения
        appeal_id: appeal_id, // ID обновляемого обращения
        rejectReason: rejectReason // Причина отклонения обращения(только при статусе rejected)
      },
    }).then(this._checkResponse)
```
Returns updated user object
```sh
{
"appeal": 
        {
            "image": "not image",  // Ссылка на картинку при наличии картинки
            "status": "in_work",  // Статус обращения
            "_id": "612d206dd2b1bc4944dd0100",  // ID обращения
            "text": "О проживающих и зарегистрированны в квартире жильцах по форме 9", // Текст обращения
            "owner": "6126c3828f2c235cf071cd13", // ID создателя обращения
            "dateOfRequest": "30.08.2021  21:16", // Дата создания обращения
            "howReceived": "Через телеграм бота", // Через какой ресурс полученно обращение
            "type": "statement", // Тип обращения (Справка)
            "adminsChangedStatus": [{newLog}], // Логи администраторов измененивших статус обращения
            "__v": 0
        }
}
```