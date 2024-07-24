-- Creating a Function in PostreSQL to UPDATE the total_balance after every insertion (new record) and taking into account the income_transaction and expense_transaction --> NOTE: This helps keep track and history of ALL transactions made by a User and the total_balance --> NOTE: This function() will be invoked with a trigger, which is when we try to INSERT a new record/row, so we indicate that with the "RETURNS TRIGGER"
CREATE OR REPLACE FUNCTION update_total_balance()
RETURNS TRIGGER AS $$
-- Here, we use the DECLARE clause to create a variable that will HOLD the most recent (previous) total_balance, so we are able to update it with a mathematical equation inside our function logic
DECLARE
    previous_balance NUMERIC;
BEGIN
    -- Get the previous balance
        --NOTE: The NEW keyword is used to refer to the new record/row being made
    SELECT total_balance
    INTO previous_balance
    FROM user_accounts
    WHERE user_id = NEW.user_id
    ORDER BY date_transaction DESC, id DESC
    LIMIT 1;

    -- If no previous balance exists, set it to 0
    IF previous_balance IS NULL THEN
        previous_balance := 0;
    END IF;

    -- Update the new total balance
        --NOTE: The COALESCE() function is used to ensure that if either fields are NULL, they have a default value of 0 
    NEW.total_balance := previous_balance + COALESCE(NEW.income_transactions, 0) - COALESCE(NEW.expense_transactions, 0);

    RETURN NEW;
END;
    --Here, we are closing the Function() body logic and indidcate the programming language used, which is PostgreSQL (pl = programming language, pgsql = postgres sql)
$$ LANGUAGE plpgsql;

--Creating a Trigger: This trigger is activated when a certain action occurs, which is an INSERT INTO action, and we code the instruction to EXECUTE our function
CREATE TRIGGER update_balance_after_insert
BEFORE INSERT ON user_accounts
FOR EACH ROW
EXECUTE FUNCTION update_total_balance();

--View all functions: \df
--View all triggers in a table: \dS table_name

CREATE TRIGGER update_balance_after_insert
BEFORE UPDATE ON user_accounts
FOR EACH ROW
EXECUTE FUNCTION update_total_balance();


