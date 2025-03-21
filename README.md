# Possible_Names Logs

## Log 1 - Observations about versions and types of possible queries checked manually in browser

### **V1**

- Returns strings matching patterns like `aa, ab, ac, ad, ..., ba, bb, bc, ..., za, zb, zc, ...`.
- A single query returns at most **10** results.

### **V2**

- Returns strings including alphanumeric combinations, such as `a0, a1, a2, ..., z0, z1, z2, ...`.
- A single query returns at most **12** results.

### **V3**

- Returns strings containing special characters and spaces, such as `a(space), a-, a+, ..., az` for all characters.
- A single query returns at most **15** results.

#### We need to query not single characters but combination of two atleast and aim at reducing the number of queries for maximum efficiency. Some manually tested queries returned 10 counts for combination of two as well, so in those cases we need to futher specify our queries for three characters (eg: zb returns till zbm..., so after this we need to query for zb+n to zb+z).

#### It is also noted that not all possible combinations exist. eg: from zb+a... to zb+z... zb+b... does not exist.

## Log 1 - Observations about versions and types of possible queries checked manually in browser

#### An error with code 429 was encountered due to rate limiting, which means that we need to add a way to make the requests to the API endpoints in a regulated and "human" way. Screenshots for the errors are attached below:

![Screenshot Description](</possible_names/screenshots/Screenshot%20(126).png>)
![Screenshot Description](</possible_names/screenshots/Screenshot%20(127).png>)
![Screenshot Description](</possible_names/screenshots/Screenshot%20(128).png>)
