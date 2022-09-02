DELETE FROM space_tag_status WHERE value='Rejected';

INSERT into space_tag_status (value, description) VALUES
('Deleted', 'Marked by admin as not an official tag.');
