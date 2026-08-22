#include <bits/stdc++.h>
using namespace std; 

int main() {
    int T, X;
    cin >> T >> X;
    vector<int> A(T + 1);
    for (int i = 0; i <= T; i++) cin >> A.at(i);

    int record = A.at(0);
    cout << 0 << ' ' << A.at(0) << endl;

    for (int i = 1; i <= T; i++) {
        if (abs(record - A.at(i)) >= X) {
            cout << i << ' ' << A.at(i) << endl;
            record = A.at(i);
        }
    } 
}