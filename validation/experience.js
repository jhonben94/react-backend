const validator = require('validator');
const isEmpty = require('./is_empty');

module.exports = function validarExperienceInput (data){ 
 
    

    data.title = !isEmpty(data.title)?data.title:'';
    data.company = !isEmpty(data.company)?data.company:'';
    data.location = !isEmpty(data.location)?data.location:'';
    data.from = !isEmpty(data.from)?data.from:'';
    data.description = !isEmpty(data.description)?data.description:'';
    let errors ={};
     if(validator.isEmpty(data.title)){
        errors.title = 'Job title field is required. ';
    }
    if(validator.isEmpty(data.company)){
        errors.company = 'Company field is required. ';
    }

    if(validator.isEmpty(data.from)){
        errors.from = 'From date field is required. ';
    } 
    
    return {
        errors,
        isValid: isEmpty(errors)
    };

}
