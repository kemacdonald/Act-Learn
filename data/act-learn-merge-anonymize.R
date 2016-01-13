# ACT-Learn Merge and anonymize script

rm(list=ls())
library(dplyr)
library(magrittr)

setwd("../../ACT-LEARN-RAW-DATA/data_processed/")

# Sequence data and Yoked data.

df1 <- read.csv("act-learn-sequence-all.csv", stringsAsFactors = F)
df2 <- read.csv("act-learn-replication-rb-ii-yoked-1.csv", stringsAsFactors = F)
df3 <- read.csv("act-learn-replication-rb-1.csv", stringsAsFactors = F)
df4 <- read.csv("act-learn-prior-manip.csv", stringsAsFactors = F)

# Some munging, so we can merge.

df1 %<>% mutate(age = as.character(age),
                odb_stim = as.character(odb_stim),
                odb_param = as.character(odb_param),
                trial_number = as.character(trial_number),
                block_factor = as.factor(block),
                framing_condition = "none",
                experiment = "sequence",
                confidence = NA) 

df2 %<>% mutate(trial_training_block = condition,
                block = as.numeric(block),
                block_factor = as.factor(block),
                condition = ifelse(condition == "receptive", "receptive_receptive", 
                                   ifelse(condition == "active", "active_active", 
                                          condition)),
                framing_condition = "none",
                experiment = "replication",
                confidence = NA)

df3 %<>% mutate(trial_training_block = condition,
                category_type = "rule-based",
                age = as.character(age),
                odb_stim = as.character(odb_stim),
                odb_param = as.character(odb_param),
                trial_number = as.character(trial_number),
                block_factor = as.factor(block),
                condition = ifelse(condition == "receptive", "receptive_receptive", 
                                   ifelse(condition == "active", "active_active", 
                                          condition)),
                framing_condition = "none", 
                experiment = "replication") %>% 
    select(-radius_trial)

df4 %<>% mutate(age = as.character(age),
                block = as.numeric(block),
                odb_stim = as.character(odb_stim),
                odb_param = as.character(odb_param),
                trial_number = as.character(trial_number),
                block_factor = as.factor(block),
                experiment = "prior-manipulation",
                confidence = NA) 

# Now merge all experiments
df <- bind_rows(df1, df2, df3, df4)

## Anonymize workerids before moving to version control

# grab worker ids and create anonymous id number
anonymized_df <- df %>% 
    select(workerid) %>% 
    distinct() %>% 
    mutate(subids = 1:nrow(.))

# now join with original data frame
df_final_clean <- left_join(df, anonymized_df, by = "workerid") 
df_final_clean <- select(df_final_clean, -workerid)
    

## Write final data file
write.csv(df_final_clean, file = "../../ACT-LEARN-GIT/data/act-learn-all-data-tidy.csv", row.names = F)
