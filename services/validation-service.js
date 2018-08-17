function Validation() {
    this.isValidString = function(str) {
        if (str.trim() !== "") {
            return true;
        }
        return false;
    };
}

exports.Validation = Validation;