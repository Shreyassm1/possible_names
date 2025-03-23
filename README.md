# Possible_Names Logs

### Log 1 - Observations about versions and types of possible queries checked manually in browser

##### V1

- Returns strings matching patterns like `aa, ab, ac, ad, ..., ba, bb, bc, ..., za, zb, zc, ...`.
- A single query returns at most **10** results.

##### V2

- Returns strings including alphanumeric combinations, such as `a0, a1, a2, ..., z0, z1, z2, ...`.
- A single query returns at most **12** results.

##### V3

- Returns strings containing special characters and spaces, such as `a(space), a-, a+, ..., az` for all characters.
- A single query returns at most **15** results.

##### We need to query not single characters but combination of two atleast and aim at reducing the number of queries for maximum efficiency. Some manually tested queries returned 10 counts for combination of two as well, so in those cases we need to futher specify our queries for three characters (eg: zb returns till zbm..., so after this we need to query for zb+n to zb+z).

##### It is also noted that not all possible combinations exist. eg: from zb+a... to zb+z... zb+b... does not exist.

### Log 2 - Adding script and encountering rate limiting error.

##### An error with code 429 was encountered due to rate limiting, which means that we need to add a way to make the requests to the API endpoints in a regulated and "human" way. Screenshots for the errors are attached below:

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(126).png" width="500" >

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(127).png" width="500" >

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(128).png" width="500" >

### Log 3 - Avoiding rate limiting and checking for duplicate names after extraction to confirm script logic.

##### Rate limiting is avoided using exponential backing and adding a random time delay for every request using a simple promise. If error 429 occurs, the program waits and retires and the delay is doubled for the next retry. Random delay introduces human-like behaviour. It can be adjusted easily using min and max delay time.

##### New Logic was added for accessing strings beyond 10th/12th/15th count by slicing off the last string of a query and removing the 3rd character. Example : aakfubvxv --> k, so we ran another loop from k to z for aa else a new query for ab would have started and these "hidden" elements would have never been accessed.

##### I checked for duplicates using check_duplicate.js to make sure my logic worked and it did, no duplicates were found.

##### Using a set does not require checking for duplicates, since it automatically stores only unique values.

##### **Problems faced:**

- Adding logic for returning strings beyond the 10th/12th/15th count consisted of nesting a third for loop.
- Individual requests meant returning only one string for each "hidden" string beyond 10th/12th/15th.
- Slow process since each request resulted in minimal returns for random time delay.
- I tried using bottleneck library but ran into errors such as "socket hang up" very early so ditched the idea and used a manual method.

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(129).png" width="500">

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(130).png" width="500" >

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(131).png" width="500" >

### Log 4 - Found /solution/

#### Tried following the instructions given at the root URL, used POSTMAN.

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(137).png" width="500" >

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(138).png" width="500" >

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(139).png" width="500" >

### Log 5 - Found /help/, /hint/ -> max_results

##### Used ffuf and big.txt, medium.txt

##### Used max_results parameter and max_results_range to improve efficiency.

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(133).png" width="500" >

### Log 6 - Successfully found all names in V1,V2,V3

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(135).png" width="500" >

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(136).png" width="500" >

<img src="https://github.com/Shreyassm1/possible_names/blob/main/screenshots/Screenshot%20(140).png" width="500" >

##### Decided to run version-wise scripts, separately and simulataneously.

### Final Log - Submission

##### For loops have been replaced with an algorithm that goes deeper than just two characters. This was needed because there were prefixes where double characters also had more strings than than max_results.

##### V3 can be optimized further by improving the querying of special characters. Eg: spaces are not seen together so those cases can be skipped. There are too many redundant queries for V3 and some for V2. Also space at the third position does not seem to be a case.

##### Nested For-loop logic still returns around 70 percent of the names in both V2 and V3.
