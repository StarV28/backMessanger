class CRUDManager {
  // Конструктор принимает модель (MongoDB модель через Mongoose)
  constructor(model) {
    this.model = model; // Сохраняем модель для дальнейшего использования в методах класса
  }

  // Метод для получения списка документов с фильтрацией, проекцией и популяцией
  async getList(filters = {}, projection = null, populateFields = []) {
    try {
      // Создаем запрос на поиск с фильтрами и проекцией
      let query = this.model.find(filters, projection);

      // Если переданы поля для популяции, добавляем их
      if (populateFields.length > 0) {
        populateFields.forEach((field) => {
          if (typeof field === 'string') {
            query = query.populate(field);
          } else if (
            typeof field === 'object' &&
            field.fieldForPopulation &&
            field.requiredFieldsFromTargetObject
          ) {
            query = query.populate(
              field.fieldForPopulation,
              field.requiredFieldsFromTargetObject
            );
          }
        });
      }
      // Выполняем запрос
      const results = await query.exec();
      // Конвертируем результаты в обычные JavaScript объекты
      return results.map((doc) => doc.toObject());
    } catch (error) {
      // Обрабатываем ошибки
      throw new Error('Error retrieving data: ' + error.message);
    }
  }

  // Метод для создания нового документа и его сохранения в базе данных
  async create(data) {
    try {
      // Создаем новый экземпляр модели с переданными данными
      const newItem = new this.model(data);

      // Сохраняем новый документ в базе данных
      return await newItem.save();
    } catch (error) {
      // Обрабатываем ошибки и выбрасываем исключение с пояснением
      throw new Error('Error creating data: ((' + error.message);
    }
  }

  // Метод для получения одного документа по ID с популяцией полей
  async getById(id, populateFields = []) {
    try {
      // Создаем запрос на поиск документа по ID
      let query = this.model.findById(id);

      // Добавляем поля для популяции
      populateFields.forEach((field) => {
        query = query.populate(field);
      });

      // Выполняем запрос к базе данных
      return await query.exec();
    } catch (error) {
      // Обрабатываем ошибки и выбрасываем исключение с пояснением
      throw new Error('Error finding data by id: ' + error.message);
    }
  }

  // Метод для поиска одного документа по фильтру с проекцией и популяцией
  async findOne(filters = {}, projection = null, populateFields = []) {
    try {
      // Создаем запрос на поиск одного документа с фильтрами и проекцией
      let query = this.model.findOne(filters, projection);

      // Добавляем поля для популяции
      populateFields.forEach((field) => {
        if (typeof field === 'string') {
          // Если поле передано как строка, используем его напрямую
          query = query.populate(field);
        } else if (
          typeof field === 'object' &&
          field.fieldForPopulation && // Поле, которое нужно заполнить
          field.requiredFieldsFromTargetObject // Поля, которые нужно включить из заполненного объекта
        ) {
          // Если передан объект, применяем параметры для populate
          query = query.populate(
            field.fieldForPopulation,
            field.requiredFieldsFromTargetObject
          );
        }
      });

      // Выполняем запрос к базе данных
      return await query.exec();
    } catch (error) {
      // Обрабатываем ошибки и выбрасываем исключение с пояснением
      throw new Error('Error finding data by id: ' + error.message);
    }
  }

  // Метод для обновления документа по его ID
  async update(id, data) {
    try {
      // Ищем документ по ID и обновляем его с новыми данными
      return await this.model
        .findByIdAndUpdate(
          id, // ID документа для обновления
          data, // Новые данные
          { new: true, runValidators: true } // Опции: возвращать обновленный документ и проверять валидаторы
        )
        .exec();
    } catch (error) {
      // Обрабатываем ошибки и выбрасываем исключение с пояснением
      throw new Error('Error updating data: ' + error.message);
    }
  }

  // Метод для удаления документа по его ID
  async delete(id) {
    try {
      // Ищем документ по ID и удаляем его
      return await this.model.findByIdAndDelete(id).exec();
    } catch (error) {
      // Обрабатываем ошибки и выбрасываем исключение с пояснением
      throw new Error('Error deleting data: ' + error.message);
    }
  }
}

export default CRUDManager;
