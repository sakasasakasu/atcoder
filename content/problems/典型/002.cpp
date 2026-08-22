#include <bits/stdc++.h>
using namespace std;

bool isvalid(const string &S) {
    int score = 0;
    for (auto c : S) {
        if (c == '(') score++;
        else if (c == ')') score--;

        if (score < 0) return false;
    }

    return (score == 0); //かっこいい
}


int main() {
    int N;
    cin >> N;

    if (N % 2 != 0) return 0; //かっこが作れないので返す

    for (int bit = 0; bit < (1<<N); bit++) {
        string S = "";

        for (int i = N - 1; i >= 0; i--) {
            if (!(bit & (1<<i))) S += "(";
            else S += ")";
        }

        if (isvalid(S)) cout << S << endl;
    }
}
