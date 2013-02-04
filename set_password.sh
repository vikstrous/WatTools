echo -n $1 | sha512sum | cut -c-128  > .adminpassword
