class APIFeatures {
  // queryString example
  //127.0.0.1:3000/api/v1/tours?difficulty=easy&sort=1&duration[gte]=5&sort=-price,-ratingsAverage&fields=name,duration,difficulty,price&page=4
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };

    const excludedFields = [
      'page',
      'sort',
      'limit',
      'fields'
    ];
    excludedFields.forEach(el => delete queryObj[el]);

    //1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    // //  \b means exact match word   /g replace all matching words
    // { difficulty: 'easy',duration: { gte: '5' },price: { lt: '1500' } }  -> changed to the following
    // { difficulty: 'easy',duration: { '$gte': '5' },price: { '$lt': '1500' } }
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      match => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      console.log(this.queryString.sort);
      const sortBy = this.queryString.sort
        .split(',')
        .join(' ');
      this.query = this.query.sort(sortBy);
      // sort('price ratingAverage')
    } else {
      //default sorting
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields
        .split(',')
        .join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // excluding __v field
    }

    return this;
  }

  paginate() {
    //4) Pagination  127.0.0.1:3000/api/v1/tours?page=2&limit=10
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    // if (this.queryString.page) {
    //   const numTours = await Tour.countDocuments();
    //   if (skip >= numTours)
    //     throw new Error('This page does not exist');
    // }

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
