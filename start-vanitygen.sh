pm2 start vanitygen --name VanityExact -- -k -f ./search/exact -o ./search/results
pm2 start vanitygen --name VanityQuick -- -i -k -f ./search/quick -o ./search/results
