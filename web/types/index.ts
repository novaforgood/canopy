import { NextPage } from "next";
import React from "react";


export type CustomPage<P = {}> = NextPage<P> & {
  
  requiresAuthentication: boolean;
}