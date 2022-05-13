-- TODO Move this into single SQL file with documentation.

INSERT INTO `BBY35_caretaker_info`
  (`account_id`,
  `animal_affection`,
  `experience`,
  `allergies`,
  `other_pets`,
  `busy_hours`,
  `house_type`,
  `house_active_level`,
  `people_in_home`,
  `children_in_home`,
  `yard_type`)
  VALUES (8, 9,
          'None, I like dogs.',
          '',
          '',
          '',
          'house', 0, 2, 0, 'not enclosed');

INSERT INTO `BBY35_caretaker_info`
  (`account_id`,
  `animal_affection`,
  `experience`,
  `allergies`,
  `other_pets`,
  `busy_hours`,
  `house_type`,
  `house_active_level`,
  `people_in_home`,
  `children_in_home`,
  `yard_type`)
  VALUES (9, 10,
          'I like cats',
          'I''m allergic to dogs.',
          '2 Cats, Siamese and Tabby.',
          'I''m retired.',
          'apartment', 1, 3, 1, 'no yard');

INSERT INTO `BBY35_caretaker_info`
  (`account_id`,
  `animal_affection`,
  `experience`,
  `allergies`,
  `other_pets`,
  `busy_hours`,
  `house_type`,
  `house_active_level`,
  `people_in_home`,
  `children_in_home`,
  `yard_type`)
  VALUES (10, 5, 
          NULL, NULL,
          NULL, NULL, 
          'other', 2, 5, 0, 'partially enclosed');