import { YaForm, FormActions } from 'meteor/ya-react-form';
import { CallPromiseMixin as callPromiseMixin } from 'meteor/didericis:callpromise-mixin';
import { ValidationError } from 'meteor/mdg:validation-error';

YaForm.validatedMethod = ({ name, method }) => {
  const validator = ({ form, dispatch }) => {
    try {
      method.validate(form);
    } catch (exception) {
      if (ValidationError.is(exception)) {
        dispatch(FormActions.error({ formName: name, reason: exception.reason }));
        exception.details.forEach(obj => {
          dispatch(FormActions.invalidateField(
            { formName: name, name: obj.name, reason: obj.type }
          ));
        });
      } else {
        throw new Error('ValidatedMethod\'s validate must throw an mdg:validation-error');
      }
    }
  };
  const makePromise = ({ form }) => {
    const promise = !method.hasOwnProperty('callPromise') ? callPromiseMixin(method) : method;
    return promise.callPromise({ ...form });
  };
  return YaForm.submit({ name, validator, method: makePromise });
};
