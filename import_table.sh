#!/bin/bash

# Check for correct number of arguments
if [ "$#" -ne 3 ]; then
    echo "Usage: ./import_table.sh <connection_url> <table_name> <backup_file>"
    exit 1
fi

# Assign arguments to variables
CONNECTION_URL=$1
TABLE_NAME=$2
BACKUP_FILE=$3

# Quote the table name to handle reserved words and special characters
TABLE_NAME_QUOTED="\"$TABLE_NAME\""

# Import data into specified table
psql $CONNECTION_URL -c "COPY $TABLE_NAME_QUOTED FROM STDIN;" < $BACKUP_FILE

