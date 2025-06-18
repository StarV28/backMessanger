
const errorHandler = (app) => {
  app.use((req, res, next) => {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
  });
  // error handler
  // app.use((err, req, res, next) => {
  //   // set locals, only providing error in development
  //   res.locals.message = err.message;
  //   res.locals.error = req.app.get('env') === 'development' ? err : {};
  //   // render the error page
  //   res.status(err.status || 500);
  //   res.render('error');
  // });
   app.use ((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Server Error';

    // Вернуть ошибку в формате JSON
    res.status(status).json({
      success: false,
      message: message,
    });
  });

}
export default errorHandler 